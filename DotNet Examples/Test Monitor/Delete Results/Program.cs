using Delete_Results;
using NationalInstruments.SystemLink.Clients.Examples;
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

        /// <summary>
        /// Simulates taking an electrical power measurement.
        /// This introduces some random current and voltage loss.
        /// </summary>
        /// <param name="current">The electrical current value.</param>
        /// <param name="voltage">The electrical voltage value.</param>
        /// <returns>The a tuple containing the electrical power measurements and the input and output lists.</returns>
        private static (double power, List<NamedValue> inputs, List<NamedValue> outputs) MeasurePower(int current, int voltage = 0)
        {
            var random = new Random();
            var currentLoss = 1 - random.NextDouble() * 0.25;
            var voltageLoss = 1 - random.NextDouble() * 0.25;
            var power = current * currentLoss * voltage * voltageLoss;

            // Record electrical current and voltage as inputs.
            var inputs = new List<NamedValue>()
            {
                new NamedValue("current", current),
                new NamedValue("voltage", voltage)
            };

            // Record electrical power as an output.
            var outputs = new List<NamedValue>()
            {
                new NamedValue("power", power)
            };

            return (power, inputs, outputs);
        }

        /// <summary>
        /// Builds a Test Monitor measurement parameter object for the power test.
        /// </summary>
        /// <param name="power">The electrical power measurement.</param>
        /// <param name="lowLimit">The value of the low limit for the test.</param>
        /// <param name="highLimit">The value of the high limit for the test.</param>
        /// <param name="status">The measurement's pass/fail status.</param>
        /// <returns>A list of test measurement parameters.</returns>
        private static List<Dictionary<string, string>> BuildPowerMeasurementParams(
            double power,
            double lowLimit,
            double highLimit,
            Status status)
        {
            var parameter = new Dictionary<string, string>()
            {
                ["name"] = "Power Test",
                ["status"] = status.StatusType.ToString(),
                ["measurement"] = power.ToString(CultureInfo.InvariantCulture),
                ["units"] = "Watts",
                ["nominalValue"] = null,
                ["lowLimit"] = lowLimit.ToString(CultureInfo.InvariantCulture),
                ["highLimit"] = highLimit.ToString(CultureInfo.InvariantCulture),
                ["comparisonType"] = "GELE"
            };

            var parameters = new List<Dictionary<String, String>>() { parameter };
            return parameters;
        }

        /// <summary>
        /// Creates a <see cref="StepData"/> object and
        /// populates it to match the TestStand data model.
        /// </summary>
        /// <param name="name">The test step's name.</param>
        /// <param name="stepType">The test step's type.</param>
        /// <param name="inputs">The test step's input values.</param>
        /// <param name="outputs">The test step's output values.</param>
        /// <param name="parameters">The measurement parameters.</param>
        /// <returns>The <see cref="StepData"/> used to create a test step.</returns>
        private static StepData GenerateStepData(
            string name,
            string stepType,
            List<NamedValue> inputs = null,
            List<NamedValue> outputs = null,
            List<Dictionary<String, String>> parameters = null,
            Status status = null)
        {
            var random = new Random();
            var stepStatus = status ?? new Status(StatusType.Running);

            var stepData = new StepData()
            {
                Name = name,
                Inputs = inputs,
                Outputs = outputs,
                StepType = stepType,
                Status = stepStatus,
                TotalTimeInSeconds = random.NextDouble() * 10,
                Parameters = parameters,
                DataModel = "TestStand",
            };

            return stepData;
        }
    }
}
