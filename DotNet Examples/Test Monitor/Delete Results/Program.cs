using NationalInstruments.SystemLink.Clients.Examples.TestMonitor.DeleteResults;
using NationalInstruments.SystemLink.Clients.TestMonitor;
using System;
using System.Collections.Generic;
using System.Globalization;

namespace NationalInstruments.SystemLink.Clients.Examples.TestMonitor
{
    class Program
    {
        static void Main(string[] args)
        {
            /*
             * See the configuration example for how a typical application
             * might obtain a configuration.
             */
            var configuration = ExampleConfiguration.Obtain(args);

            /*
             * Create the TestDataManager for communicating with the server.
             */
            var testDataManager = new TestDataManager(configuration);

            // Initialize a ResultData object.
            var resultData = new ResultData()
            {
                Operator = "John Smith",
                ProgramName = "Power Test",
                Status = new Status(StatusType.Running),
                SerialNumber = Guid.NewGuid().ToString(),
                PartNumber = "NI-ABC-123-PWR1"
            };
            // Create the test result.
            var testResult = testDataManager.CreateResult(resultData);

            // Delete the test result
            testDataManager.DeleteResultAsync(configuration, testResult.Id);

            // Create multiple test results
            var testResultIds = new List<string>();
            for(int i = 0;i<5;i++)
            {
                resultData.ProgramName = resultData.ProgramName + i;
                var result = testDataManager.CreateResult(resultData);
                testResultIds.Add(result.Id);
            }

            // Delete the test results
            testDataManager.DeleteResultsAsync(configuration, testResultIds);
        }
    }
}
