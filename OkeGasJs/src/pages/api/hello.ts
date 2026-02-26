import { IncomingMessage, ServerResponse } from "http";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ 
    message: "Halo dari OkeGas API! 🚀", 
    status: "success",
    timestamp: Date.now() 
  }));
}
