using System;
using NationalInstruments.SystemLink.Clients.Core;

namespace NationalInstruments.SystemLink.Clients.Examples
{
    /// <summary>
    /// Helper class to support client API examples obtaining a configuration.
    /// </summary>
    static class ExampleConfiguration
    {
        /// <summary>
        /// Helper method to support client API examples obtaining a
        /// configuration. Exits if a suitable configuration is not available.
        /// </summary>
        /// <param name="args">The arguments used to run the example.</param>
        /// <returns>A configuration to use for the example.</returns>
        public static IHttpConfiguration Obtain(
            string[] args)
        {
            return new Parser().Parse(args);
        }

        private class Parser
        {
            public IHttpConfiguration Parse(string[] args)
            {
                if (args?.Length > 0)
                {
                    if (args[0] == "--server")
                    {
                        return ObtainServerOrExit(args);
                    }
                    else
                    {
                        return PrintUsageAndExit("Invalid Argument " + args[0]);
                    }
                }
                else
                {
                    return PrintUsageAndExit("Please provide required arguments");
                }
            }
            private IHttpConfiguration ObtainServerOrExit(string[] args)
            {
                try
                {
                    switch (args.Length)
                    {
                        case 1:
                            return PrintUsageAndExit("--server requires URL and api_key");

                        case 2:
                            return PrintUsageAndExit("--server requires the api_key");

                        case 3:
                            return new HttpConfiguration(new Uri(args[1]), args[2]);

                        default:
                            return PrintUsageAndExit("--server does not take more arguments than URL and api_key");
                    }
                }
                catch (FormatException ex)
                {
                    return PrintUsageAndExit(
                        "Invalid URL for --server: " + ex.Message);
                }
            }

            private IHttpConfiguration PrintUsageAndExit(string error)
            {
                Console.Error.WriteLine("This example requires a configuration.");
                Console.Error.WriteLine(error);
                Console.Error.WriteLine();
                Console.Error.WriteLine("Please specify a configuration using the following arguments:");
                Console.Error.WriteLine();
                Console.Error.WriteLine("\t--server <url> <api_key>");
                Console.Error.WriteLine();
                Console.Error.WriteLine("To run the example against a SystemLink Enterprise, the URL should include the");
                Console.Error.WriteLine("scheme, host, and port if not default. For example:");
                Console.Error.WriteLine("dotnet run -- --server https://myserver:9091 api_keynjnjnjnjnvgcycy");
                Environment.Exit(1);
                return null;
            }
        }
    }
}
