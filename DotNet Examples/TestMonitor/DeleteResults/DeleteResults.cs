using NationalInstruments.SystemLink.Clients.Core;
using NationalInstruments.SystemLink.Clients.TestMonitor;
using System;
using System.Collections.Generic;

namespace NationalInstruments.SystemLink.Clients.Examples.TestMonitor.DeleteResults
{
    class DeleteResults
    {
        static void Main(string[] args)
        {
            try
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
                Console.WriteLine($"The test result has been under part number={testResult.Data.PartNumber} with Id = {testResult.Id}");
                Console.WriteLine("Press any key to delete the result");
                Console.ReadKey();

                // Delete the test result
                testDataManager.DeleteResultAsync(configuration, testResult.Id);
                Console.WriteLine($"\nThe test result with Id = {testResult.Id} has been deleted");

                // Create multiple test results
                Console.WriteLine("\nCreating multiple test results.\nResult Ids has been listed down below");
                var testResultIds = new List<string>();
                for (int i = 0; i < 5; i++)
                {
                    resultData.ProgramName = resultData.ProgramName + i;
                    var result = testDataManager.CreateResult(resultData);
                    testResultIds.Add(result.Id);
                    Console.WriteLine($"{result.Id}");
                }

                // Delete the test results
                Console.WriteLine("\nThe multiple results has been created successfully");
                Console.WriteLine("Please any key to delete these results");
                Console.ReadKey();
                testDataManager.DeleteResultsAsync(configuration, testResultIds);
                Console.WriteLine("\nResults has been deleted successfully");
            }
            catch(ApiException exception)
            {
                Console.WriteLine(exception.Message);
                Console.WriteLine("The given Url or the API key was wrong, please run the example with the correct Url and api_key.");
                Console.WriteLine("For more information on how to generate API key, please refer to the documentation provided.");
            }
            catch(Exception exception)
            {
                Console.WriteLine(exception.Message);
            }
        }
    }
}
