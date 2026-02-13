const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Generate HTML report from JSON
const options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber-report.json',
  output: 'reports/cucumber-html-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'Test Environment': process.env.BASE_URL || 'Not Specified',
    'Browser': process.env.BROWSER || 'chromium',
    'Platform': process.platform,
    'Executed': new Date().toLocaleString()
  }
};

// Check if JSON report exists
if (fs.existsSync(options.jsonFile)) {
  reporter.generate(options);
  console.log('HTML Report generated successfully!');
  console.log(`Report location: ${path.resolve(options.output)}`);
} else {
  console.log('JSON report not found. Skipping HTML report generation.');
}
