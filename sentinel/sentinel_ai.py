from colorama import init, Fore, Style
import sys
import socket
import psutil
import platform
import logging
import argparse


def banner():
    print(Fore.CYAN + Style.BRIGHT + r"""
   _____            _   _ _       _    _    ___
  / ____|          | | (_) |     | |  | |  |__ \
 | (___   ___ _ __ | |_ _| | __ _| |  | |     ) |
  \___ \ / _ \ '_ \| __| | |/ _` | |  | |    / /
  ____) |  __/ | | | |_| | | (_| | |__| |   / /_
 |_____/ \___|_| |_|\__|_|_|\__,_|\____/   |____|
    Sentinel AI - Cybersecurity CLI
          by Muhammad Dhiyaul Atha
""" + Style.RESET_ALL)


def report_summary():
    """
    Print a summary report of all connections and risk levels.
    """
    print_header("Sentinel AI Security Report")
    try:
        conns = psutil.net_connections(kind='inet')
        total = len(conns)
        external = 0
        risk_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
        scores = []
        for c in conns:
            if c.raddr and not is_private_ip(c.raddr.ip):
                external += 1
            risk, score, _ = classify_risk(c)
            risk_counts[risk] += 1
            scores.append(score)
        overall_score = int(sum(scores) / len(scores)) if scores else 0
        if overall_score >= 70:
            overall_risk = "HIGH"
        elif overall_score >= 40:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"
        print(f"Total connections: {total}")
        print(f"External connections: {external}")
        print(f"High risk: {risk_counts['HIGH']}")
        print(f"Medium risk: {risk_counts['MEDIUM']}")
        print(f"Low risk: {risk_counts['LOW']}")
        risk_colored = color_risk(overall_risk)
        print("Overall system risk: {} ({}/100)".format(risk_colored, overall_score))

    except Exception as e:
        print_error(f"Failed to generate report: {e}")
        logging.exception("Error in report_summary")


#!/usr/bin/env python3
"""
Sentinel AI - Professional Cybersecurity CLI Tool

Features:
- Network scanner (active connections)
- System information display
- Connection analyzer with risk classification
- Explain suspicious connections
- Colored output (colorama)
- Logging system
- Modular, clean, production-ready code
"""


# Initialize colorama
init(autoreset=True)

# Configure logging
logging.basicConfig(
    filename='sentinel_ai.log',
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

# --- Utility Functions ---


def print_header(text):
    print(Fore.CYAN + Style.BRIGHT + f"\n=== {text} ===" + Style.RESET_ALL)


def print_error(text):
    print(Fore.RED + Style.BRIGHT + f"[ERROR] {text}" + Style.RESET_ALL)


def print_success(text):
    print(Fore.GREEN + Style.BRIGHT + f"[OK] {text}" + Style.RESET_ALL)


def print_warning(text):
    print(Fore.YELLOW + Style.BRIGHT + f"[WARNING] {text}" + Style.RESET_ALL)


def color_risk(risk):
    if risk == "HIGH":
        return Fore.RED + Style.BRIGHT + risk + Style.RESET_ALL
    elif risk == "MEDIUM":
        return Fore.YELLOW + Style.BRIGHT + risk + Style.RESET_ALL
    else:
        return Fore.GREEN + Style.BRIGHT + risk + Style.RESET_ALL


def is_private_ip(ip):
    try:
        ip = ip.strip()
        if ip.startswith("127.") or ip == "localhost":
            return True
        if ip.startswith("10.") or ip.startswith(
                "192.168.") or ip.startswith("172."):
            return True
        return False
    except Exception:
        return False


def get_hostname(ip):
    try:
        return socket.gethostbyaddr(ip)[0]
    except Exception:
        return "Unknown"


def get_process_name(pid):
    try:
        return psutil.Process(pid).name()
    except Exception:
        return "Unknown"

# --- Feature Implementations ---


def scan_connections():
    """
    Show active network connections using psutil.
    """
    print_header("Active Network Connections")
    try:
        conns = psutil.net_connections(kind='inet')
        if not conns:
            print_warning("No active network connections found.")
            return
        for c in conns:
            laddr = f"{c.laddr.ip}:{c.laddr.port}" if c.laddr else ""
            raddr = f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else ""
            pname = get_process_name(c.pid) if c.pid else "N/A"
            proto = "TCP" if c.type == socket.SOCK_STREAM else "UDP"
            print(
                f"{proto:<6} {laddr:<22} {raddr:<22} {c.status:<13} {str(c.pid):<7} {pname:<20}")
    except Exception as e:
        print_error(f"Failed to scan connections: {e}")
        logging.exception("Error in scan_connections")


def system_info():
    """
    Display system information.
    """
    print_header("System Information")
    try:
        uname = platform.uname()
        print(f"{Fore.CYAN}OS: {Style.RESET_ALL}{uname.system} {uname.release}")
        print(f"{Fore.CYAN}Kernel: {Style.RESET_ALL}{uname.version}")
        print(f"{Fore.CYAN}Hostname: {Style.RESET_ALL}{uname.node}")
        print(f"{Fore.CYAN}CPU: {Style.RESET_ALL}{uname.processor}")
        mem = psutil.virtual_memory()
        print(f"{Fore.CYAN}Memory: {Style.RESET_ALL}{mem.total // (1024 ** 2)} MB")
    except Exception as e:
        print_error(f"Failed to get system info: {e}")
        logging.exception("Error in system_info")


def analyze_connections():
    """
    Analyze network connections and detect suspicious IPs/processes.
    """
    print_header("Connection Analysis")
    try:
        conns = psutil.net_connections(kind='inet')
        if not conns:
            print_warning("No active network connections found.")
            return
        for c in conns:
            laddr = f"{c.laddr.ip}:{c.laddr.port}" if c.laddr else ""
            raddr = f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else ""
            pname = get_process_name(c.pid) if c.pid else "N/A"
            proto = "TCP" if c.type == socket.SOCK_STREAM else "UDP"
            risk, score, reason = classify_risk(c)
            risk_str = f"{risk} ({score}/100)"
            print(
                f"{proto:<6}"
                f"{laddr:<22}"
                f"{raddr:<22}"
                f"{str(c.pid):<7}"
                f"{pname:<20}"
                f"{color_risk(risk_str):<16}"
                f"{reason}"
            )

    except Exception as e:
        print_error(f"Failed to analyze connections: {e}")
        logging.exception("Error in analyze_connections")


def classify_risk(conn):
    """
    Classify risk level for a connection.
    Returns (risk_level, reason)
    """
    try:
        # Unusual ports
        unusual_ports = set(range(0, 1024)) - {22, 80, 443, 53, 25, 110, 143}
        # Known safe processes (can be extended)
        known_processes = {
            "systemd",
            "sshd",
            "nginx",
            "apache2",
            "chrome",
            "firefox",
            "python",
            "python3"}
        risk = "LOW"
        reasons = []
        score = 0

        # External IP: +40
        if conn.raddr and not is_private_ip(conn.raddr.ip):
            score += 40
            reasons.append("External IP connection")

        # Unusual port: +25
        if conn.raddr and conn.raddr.port in unusual_ports:
            score += 25
            reasons.append(f"Unusual port {conn.raddr.port}")

        # Unknown process: +25
        pname = get_process_name(conn.pid) if conn.pid else ""
        if pname and pname.lower() not in known_processes:
            score += 25
            reasons.append(f"Unknown process: {pname}")

        # If all three: +10 bonus
        if ("External IP connection" in reasons and
            any("Unusual port" in r for r in reasons) and
                any("Unknown process" in r for r in reasons)):
            score += 10

        # Clamp score to 0-100
        score = min(max(score, 0), 100)

        # Assign risk level
        if score >= 70:
            risk = "HIGH"
        elif score >= 40:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        if not reasons:
            reasons.append("No suspicious activity detected")
        return risk, score, "; ".join(reasons)
    except Exception as e:
        logging.exception("Error in classify_risk")
        return "LOW", 0, "Analysis error"


def explain_connection(ip_or_conn):
    """
    Explain if an IP or connection might be dangerous.
    """
    print_header("Connection Explanation")
    try:
        # If input is an IP, check if it's private or external
        ip = ip_or_conn.strip()
        if is_private_ip(ip):
            print_success(
                f"{ip} is a private/local IP address. Risk: {color_risk('LOW')}")
            print("Private IPs are generally safe within your local network.")
        else:
            print_warning(
                f"{ip} is an external IP address. Risk: {
                    color_risk('MEDIUM')}")
            print("External IPs may pose a risk if you do not recognize the connection.")
            print(
                "Check the process and port associated with this connection for further analysis.")
    except Exception as e:
        print_error(f"Failed to explain connection: {e}")
        logging.exception("Error in explain_connection")

# --- Main CLI ---


def debug_code(file_path):
    """
    Debug Python code by running it and catching exceptions.
    """
    print_header("Debug Code")
    import runpy
    try:
        runpy.run_path(file_path, run_name="__main__")
        print_success(f"Code in {file_path} executed successfully.")
    except Exception as e:
        print_error(f"Exception occurred: {e}")
        logging.exception(f"Debug error in {file_path}")


def explain_code(file_path):
    """
    Explain Python code by summarizing its purpose and structure.
    """
    print_header("Explain Code")
    try:
        with open(file_path, 'r') as f:
            code = f.read()
        # Simple explanation: show docstring and function/class names
        import ast
        tree = ast.parse(code)
        docstring = ast.get_docstring(tree)
        if docstring:
            print(f"Docstring: {Fore.GREEN}{docstring}{Style.RESET_ALL}")
        print("\nFunctions and Classes:")
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                print(f"- Function: {node.name}")
            elif isinstance(node, ast.ClassDef):
                print(f"- Class: {node.name}")
        print_success("Code explanation complete.")
    except Exception as e:
        print_error(f"Failed to explain code: {e}")
        logging.exception(f"Explain code error in {file_path}")


def improve_code(file_path):
    """
    Improve Python code formatting using autopep8.
    """
    print_header("Improve Code")
    try:
        import autopep8
        with open(file_path, 'r') as f:
            code = f.read()
        improved = autopep8.fix_code(code)
        with open(file_path, 'w') as f:
            f.write(improved)
        print_success(f"Code in {file_path} improved and formatted.")
    except ImportError:
        print_error(
            "autopep8 is not installed. Install with: pip install autopep8")
    except Exception as e:
        print_error(f"Failed to improve code: {e}")
        logging.exception(f"Improve code error in {file_path}")


def main():
    banner()
    parser = argparse.ArgumentParser(
        description="Sentinel AI - Professional Cybersecurity CLI Tool"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # scan command
    scan_parser = subparsers.add_parser(
        "scan", help="Show active network connections")

    # system command
    system_parser = subparsers.add_parser(
        "system", help="Display system information")

    # analyze command
    analyze_parser = subparsers.add_parser(
        "analyze", help="Analyze connections and detect suspicious activity")

    # explain command
    explain_parser = subparsers.add_parser(
        "explain", help="Explain if an IP/connection is dangerous")
    explain_parser.add_argument("ip", help="IP address to explain")

    # debug command
    debug_parser = subparsers.add_parser(
        "debug", help="Debug a Python file (run and catch exceptions)")
    debug_parser.add_argument("file", help="Path to Python file to debug")

    # explain-code command
    explain_code_parser = subparsers.add_parser(
        "explain-code", help="Explain a Python code file")
    explain_code_parser.add_argument(
        "file", help="Path to Python file to explain")

    # improve-code command
    improve_code_parser = subparsers.add_parser(
        "improve-code", help="Auto-format a Python code file")
    improve_code_parser.add_argument(
        "file", help="Path to Python file to improve")

    # report command
    report_parser = subparsers.add_parser(
        "report", help="Show summary report of system network risk")

    args = parser.parse_args()

    try:
        if args.command == "scan":
            scan_connections()
        elif args.command == "system":
            system_info()
        elif args.command == "analyze":
            analyze_connections()
        elif args.command == "explain":
            explain_connection(args.ip)
        elif args.command == "debug":
            debug_code(args.file)
        elif args.command == "explain-code":
            explain_code(args.file)
        elif args.command == "improve-code":
            improve_code(args.file)
        elif args.command == "report":
            report_summary()
        else:
            parser.print_help()
    except KeyboardInterrupt:
        print_error("Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        logging.exception("Fatal error in main")
        sys.exit(1)


if __name__ == "__main__":
    main()
