export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Ramadan Tracker API",
    version: "1.0.0",
    description:
      "A simple REST API to track fasting and daily worship activities during Ramadan.",
  },
  tags: [
    { name: "Test", description: "API status" },
    { name: "Puasa", description: "Fasting tracker" },
    { name: "Ibadah", description: "Worship tracker" },
    { name: "Target", description: "Ramadan goals tracker" },
  ],
  paths: {
    "/test": {
      get: {
        tags: ["Test"],
        summary: "Check API status",
        responses: { 200: { description: "API is running" } },
      },
    },

    // ─── PUASA ───────────────────────────────────────────
    "/api/puasa": {
      get: {
        tags: ["Puasa"],
        summary: "Get all fasting records",
        responses: { 200: { description: "List of fasting records" } },
      },
      post: {
        tags: ["Puasa"],
        summary: "Add a fasting record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tanggal", "status"],
                properties: {
                  tanggal: { type: "string", example: "2026-03-01" },
                  status: {
                    type: "string",
                    enum: ["penuh", "qadha", "batal"],
                    example: "penuh",
                  },
                  catatan: { type: "string", example: "Alhamdulillah lancar" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          409: { description: "Duplicate date" },
        },
      },
    },
    "/api/puasa/summary": {
      get: {
        tags: ["Puasa"],
        summary: "Get fasting summary statistics",
        responses: { 200: { description: "Fasting summary" } },
      },
    },
    "/api/puasa/{id}": {
      get: {
        tags: ["Puasa"],
        summary: "Get fasting record by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Fasting record" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Puasa"],
        summary: "Update a fasting record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tanggal: { type: "string", example: "2026-03-01" },
                  status: { type: "string", enum: ["penuh", "qadha", "batal"] },
                  catatan: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Puasa"],
        summary: "Delete a fasting record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },

    // ─── IBADAH ───────────────────────────────────────────
    "/api/ibadah": {
      get: {
        tags: ["Ibadah"],
        summary: "Get all worship records",
        responses: { 200: { description: "List of worship records" } },
      },
      post: {
        tags: ["Ibadah"],
        summary: "Add a worship record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tanggal", "jenis", "status"],
                properties: {
                  tanggal: { type: "string", example: "2026-03-01" },
                  jenis: {
                    type: "string",
                    enum: [
                      "subuh",
                      "dzuhur",
                      "ashar",
                      "maghrib",
                      "isya",
                      "tarawih",
                      "tahajud",
                      "tilawah",
                      "dzikir",
                    ],
                    example: "subuh",
                  },
                  status: { type: "boolean", example: true },
                  jumlah: { type: "string", example: "1 juz" },
                  catatan: { type: "string", example: "On time" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          409: { description: "Duplicate entry" },
        },
      },
    },
    "/api/ibadah/hari-ini": {
      get: {
        tags: ["Ibadah"],
        summary: "Get today's worship records",
        responses: { 200: { description: "Today's worship" } },
      },
    },
    "/api/ibadah/rekap/{tanggal}": {
      get: {
        tags: ["Ibadah"],
        summary: "Get worship recap by date",
        parameters: [
          {
            name: "tanggal",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "2026-03-01",
          },
        ],
        responses: {
          200: { description: "Worship recap" },
          404: { description: "No data found" },
        },
      },
    },
    "/api/ibadah/{id}": {
      put: {
        tags: ["Ibadah"],
        summary: "Update a worship record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tanggal: { type: "string", example: "2026-03-01" },
                  jenis: {
                    type: "string",
                    enum: [
                      "subuh",
                      "dzuhur",
                      "ashar",
                      "maghrib",
                      "isya",
                      "tarawih",
                      "tahajud",
                      "tilawah",
                      "dzikir",
                    ],
                  },
                  status: { type: "boolean" },
                  jumlah: { type: "string" },
                  catatan: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Ibadah"],
        summary: "Delete a worship record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },

    // ─── TARGET ───────────────────────────────────────────
    "/api/target": {
      get: {
        tags: ["Target"],
        summary: "Get all goals",
        responses: { 200: { description: "List of goals" } },
      },
      post: {
        tags: ["Target"],
        summary: "Create a new goal",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nama", "target_nilai", "satuan"],
                properties: {
                  nama: { type: "string", example: "Khatam Al-Quran" },
                  deskripsi: {
                    type: "string",
                    example: "Finish reading the Quran once during Ramadan",
                  },
                  target_nilai: { type: "number", example: 30 },
                  satuan: { type: "string", example: "juz" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/target/progress": {
      get: {
        tags: ["Target"],
        summary: "Get progress of all goals",
        responses: { 200: { description: "Goals progress" } },
      },
    },
    "/api/target/{id}": {
      get: {
        tags: ["Target"],
        summary: "Get goal by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Goal detail" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Target"],
        summary: "Update a goal",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nama: { type: "string" },
                  deskripsi: { type: "string" },
                  target_nilai: { type: "number" },
                  satuan: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Target"],
        summary: "Delete a goal",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/target/{id}/progress": {
      patch: {
        tags: ["Target"],
        summary: "Add progress to a goal",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tambah_nilai"],
                properties: {
                  tambah_nilai: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Progress updated" },
          404: { description: "Not found" },
        },
      },
    },
  },
};
