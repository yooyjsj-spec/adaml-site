const response = await fetch('http://127.0.0.1:4000/api/health');
process.exit(response.ok ? 0 : 1);
