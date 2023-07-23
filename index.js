const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execFile } = require('child_process');
const exeFilePaths = ["backend/dealsdata/amazon.exe", "backend/dealsdata/bestbuy.exe", "backend/dealsdata/woot.exe"];
// const bestbuy = "backend/dealsdata/bestbuy.exe"
// const woot = "backend/dealsdata/woot.exe"

const app = express();
app.use(cors({ origin: '*' }))

app.get('/mergeJSON', async (req, res) => {
    const directoryPaths = ['./backend/dealsdata/Amazon','./backend/dealsdata/BestBuy', './backend/dealsdata/Woot'];
    let mergedData = [];
  
    try {
      const promises = directoryPaths.map(directoryPath => {
        return new Promise((resolve, reject) => {
          fs.readdir(directoryPath, (err, files) => {
            if (err) {
              console.error('Error reading directory:', err);
              reject(err);
              return;
            }
  
            files.forEach(file => {
              if (path.extname(file) === '.json') {
                const filePath = path.join(directoryPath, file);
                const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                mergedData = [ ...mergedData, ...fileData ];
              }
            });
  
            resolve();
          });
        });
      });
  
      await Promise.all(promises);
      console.log(mergedData);
      res.send(mergedData);
    } catch (error) {
      console.error('Error merging JSON:', error);
      res.status(500).send('Error merging JSON');
    }
  });
app.get('/botrun', (req, res) => {
  exeFilePaths.forEach((exeFilePath) => {
    const results = [];
    execFile(exeFilePath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error occurred: ${error.message}`);
        results.push({ filePath: exeFilePath, error: error.message });
      } else {
        console.log(`Execution successful for ${exeFilePath}`);
        results.push({ filePath: exeFilePath, stdout, stderr });
      }

      // Check if all .exe files have been executed
      if (results.length === exeFilePaths.length) {
        res.json(results);
      }
    });
  });
})

// Other routes and server configuration...

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});