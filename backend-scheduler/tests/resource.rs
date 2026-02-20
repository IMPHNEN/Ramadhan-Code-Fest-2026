use sysinfo::{System, Disks};
use std::{fs, thread, time::Duration};

// --- Helper: Baca LIMIT (Hanya perlu dipanggil sekali) ---

fn get_docker_memory_limit() -> Option<u64> {
    // Cgroup V2
    if let Ok(contents) = fs::read_to_string("/sys/fs/cgroup/memory.max") {
        let val = contents.trim();
        if val == "max" { return None; }
        return val.parse::<u64>().ok();
    }
    // Cgroup V1
    if let Ok(contents) = fs::read_to_string("/sys/fs/cgroup/memory/memory.limit_in_bytes") {
        let val = contents.trim();
        if val.len() > 15 { return None; } 
        return val.parse::<u64>().ok();
    }
    None
}

fn get_docker_cpu_limit() -> Option<f64> {
    // Cgroup V2
    if let Ok(contents) = fs::read_to_string("/sys/fs/cgroup/cpu.max") {
        let parts: Vec<&str> = contents.trim().split_whitespace().collect();
        if parts.len() == 2 && parts[0] != "max" {
            let quota = parts[0].parse::<f64>().unwrap_or(0.0);
            let period = parts[1].parse::<f64>().unwrap_or(100000.0);
            return Some(quota / period);
        }
    }
    // Cgroup V1
    if let Ok(quota_str) = fs::read_to_string("/sys/fs/cgroup/cpu/cpu.cfs_quota_us") {
        let quota = quota_str.trim().parse::<f64>().unwrap_or(-1.0);
        if quota > 0.0 {
            if let Ok(period_str) = fs::read_to_string("/sys/fs/cgroup/cpu/cpu.cfs_period_us") {
                let period = period_str.trim().parse::<f64>().unwrap_or(100000.0);
                return Some(quota / period);
            }
        }
    }
    None
}

// --- Helper: Baca USAGE Realtime (Dipanggil di dalam Loop) ---

fn get_container_memory_usage() -> Option<u64> {
    // Cgroup V2
    if let Ok(contents) = fs::read_to_string("/sys/fs/cgroup/memory.current") {
        return contents.trim().parse::<u64>().ok();
    }
    // Cgroup V1
    if let Ok(contents) = fs::read_to_string("/sys/fs/cgroup/memory/memory.usage_in_bytes") {
        return contents.trim().parse::<u64>().ok();
    }
    None
}

#[test] // Gunakan cargo test --test resource -- --nocapture
pub fn monitor_realtime_dashboard() {
    let mut sys = System::new_all();
    
    // 1. SETUP AWAL (Ambil data statis sekali saja)
    let os_name = System::name().unwrap_or("Unknown".into());
    let host_name = System::host_name().unwrap_or("Unknown".into());
    let cpu_cores = sys.cpus().len();
    
    // PERBAIKAN: Tambahkan .to_string()
    let cpu_model = sys.cpus().first()
        .map(|c| c.brand().to_string()) // Ubah &str jadi String (Copy)
        .unwrap_or("Unknown".to_string()); // Default juga harus String

    // Ambil Limit Docker (Statis)
    let docker_mem_limit_bytes = get_docker_memory_limit();
    let docker_cpu_limit = get_docker_cpu_limit();

    // Setup format limit string agar tidak diproses berulang
    let limit_str = match docker_mem_limit_bytes {
        Some(b) => format!("{:.2} GB", b as f64 / 1_073_741_824.0),
        None => "Unlimited (Host RAM)".to_string(),
    };

    println!("Mempersiapkan monitoring... (Tunggu 1 detik untuk kalibrasi CPU)");
    sys.refresh_all();
    thread::sleep(Duration::from_secs(1));

    // 2. LOOP REALTIME
    loop {
        // Clear Screen (ANSI Code) -> Supaya jadi dashboard diam
        print!("\x1B[2J\x1B[1;1H");

        println!("==============================================");
        println!(" 🚀 SERVER RESOURCE MONITOR (CTRL+C to Stop)");
        println!("==============================================");
        println!("Host: {} | OS: {}", host_name, os_name);
        println!("CPU Model: {} ({} Cores)", cpu_model, cpu_cores);
        
        // --- UPDATE DATA DINAMIS ---
        sys.refresh_cpu(); // Hanya refresh CPU
        sys.refresh_memory(); // Hanya refresh RAM
        
        // A. CPU USAGE
        let global_cpu = sys.global_cpu_info().cpu_usage();
        let cpu_bar_len = (global_cpu / 5.0) as usize; // Visualisasi Bar sederhana
        let cpu_bar: String = "█".repeat(cpu_bar_len);
        
        println!("\n[CPU USAGE]");
        println!("Host Load : {:.2}% | {}", global_cpu, cpu_bar);
        if let Some(limit) = docker_cpu_limit {
            println!("Docker Lim: {:.2} vCPU", limit);
        } else {
            println!("Docker Lim: Unlimited");
        }

        // B. MEMORY USAGE (Host vs Container)
        println!("\n[MEMORY USAGE]");
        
        // Host Info (sysinfo baca /proc/meminfo)
        let host_total_gb = sys.total_memory() as f64 / 1_073_741_824.0;
        let host_used_gb = sys.used_memory() as f64 / 1_073_741_824.0;
        let host_percent = (host_used_gb / host_total_gb) * 100.0;
        
        println!("HOST      : {:.2} GB / {:.2} GB ({:.1}%)", host_used_gb, host_total_gb, host_percent);

        // Container Info (Baca Cgroups)
        if let Some(container_bytes) = get_container_memory_usage() {
            let container_gb = container_bytes as f64 / 1_073_741_824.0;
            
            // Hitung persentase pemakaian terhadap limit container
            let container_percent_str = if let Some(limit_bytes) = docker_mem_limit_bytes {
                let p = (container_bytes as f64 / limit_bytes as f64) * 100.0;
                format!("{:.1}% of Limit", p)
            } else {
                "N/A".to_string()
            };

            println!("CONTAINER : {:.2} GB (Limit: {}) -> {}", container_gb, limit_str, container_percent_str);
        } else {
            println!("CONTAINER : Gagal membaca Cgroup usage");
        }

        println!("\n[DISK INFO]");
        let disks = Disks::new_with_refreshed_list(); // Disk jarang berubah, tapi ok lah di refresh pelan2
        for disk in &disks {
             let total_gb = disk.total_space() as f64 / 1_073_741_824.0;
             let avail_gb = disk.available_space() as f64 / 1_073_741_824.0;
             println!("{:<10}: Free {:.2} GB / Total {:.2} GB", format!("{:?}", disk.mount_point()), avail_gb, total_gb);
        }

        println!("==============================================");
        println!("Updated: {:?}", std::time::SystemTime::now());

        // Jeda 1 Detik
        thread::sleep(Duration::from_secs(1));
    }
}