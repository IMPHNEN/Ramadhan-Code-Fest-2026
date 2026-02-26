export function renderErrorOverlay(err: any): string {
  const stack = err.stack || "";
  const message = err.message || "Unknown Error";
  const name = err.name || "Error";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Uncaught Error: ${message}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          background-color: #050505;
          /* Abstract Background Pattern to make blur visible */
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        
        .overlay-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: -1;
        }

        .error-popup {
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 20px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: popup-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popup-in {
            0% { transform: scale(0.95) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .popup-header {
            padding: 24px 32px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.02);
        }

        .error-tag {
          background: #ff4444;
          color: #fff;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 10px rgba(255, 68, 68, 0.3);
        }

        .popup-body {
            padding: 32px;
            overflow-y: auto;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 24px 0;
            color: #fff;
            line-height: 1.4;
        }

        .stack-trace {
            background: #000;
            padding: 20px;
            border-radius: 12px;
            overflow-x: auto;
            border: 1px solid #222;
            font-family: 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            color: #d1d1d1;
            white-space: pre-wrap;
        }

        .popup-footer {
            padding: 20px 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            justify-content: flex-end;
            background: rgba(255, 255, 255, 0.02);
        }

        .reload-btn {
            background: #fff;
            color: #000;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .reload-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
      </style>
    </head>
    <body>
      <div class="overlay-backdrop"></div>
      
      <div class="error-popup">
        <div class="popup-header">
            <div class="error-tag">${name}</div>
            <div style="font-size: 13px; color: #666;">OkeGas Render Error</div>
        </div>
        
        <div class="popup-body">
            <h1>${message}</h1>
            <div class="stack-trace">${stack}</div>
        </div>

        <div class="popup-footer">
            <button class="reload-btn" onclick="window.location.reload()">Try Again</button>
        </div>
      </div>
    </body>
    </html>
  `;
}
