using NationalInstruments.SystemLink.Clients.Core;
using NationalInstruments.SystemLink.Clients.Core.Extensions;
using NationalInstruments.SystemLink.Clients.TestMonitor;
using NationalInstruments.SystemLink.Clients.TestMonitor.Swagger.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace NationalInstruments.SystemLink.Clients.Examples.TestMonitor.DeleteResults
{
    static class TestDataManagerDeleteExtensions
    {
        private const string DeleteResultsPath = "nitestmonitor/v2/delete-results";
        private const string DeleteResultPath = "nitestmonitor/v2/results";

        /// <summary>
        /// Deletes the test result
        /// </summary>
        /// <param name="testDataManager"></param>
        /// <param name="configuration">HttpConfiguration containg the url and API key</param>
        /// <param name="resultId">test result ID which needs to be deleted</param>
        /// <param name="deleteSteps">A boolean representing whether to delete the associated steps or not</param>
        /// <returns>Http reponse message after calling delete result API</returns>
        /// <exception cref="ApiException"></exception>
        public static HttpResponseMessage DeleteResultAsync(this TestDataManager testDataManager, IHttpConfiguration configuration, string resultId, bool? deleteSteps = true)
        {
            if (resultId == null)
            {
                throw new ApiException("Missing required parameter 'resultId' when calling ResultsApi->DeleteResultV2");
            }
            string path = $"{DeleteResultPath}/{resultId}?deleteSteps={deleteSteps}";

            return TestMonitorHttpClient.RaiseDeleteRequest(configuration, path);
        }

        /// <summary>
        /// Deletes multiple test results
        /// </summary>
        /// <param name="testDataManager"></param>
        /// <param name="configuration">HttpConfiguration containg the url and API key</param>
        /// <param name="resultIds">test result Ids which needs to be deleted</param>
        /// <param name="deleteSteps">A boolean representing whether to delete steps associated with the steps</param>
        /// <returns>Http response message after calling the delete results API</returns>
        /// <exception cref="ApiException"></exception>
        public static HttpResponseMessage DeleteResultsAsync(this TestDataManager testDataManager, IHttpConfiguration configuration, List<string> resultIds, bool? deleteSteps = true)
        {
            if(resultIds.Count == 0)
            {
                throw new ApiException("ids is a required property for DeleteResultsRequest and cannot be null");
            }

            var bodyContent = new
            {
                Ids = resultIds.ToArray(),
                DeleteSteps = deleteSteps
            };            

            return TestMonitorHttpClient.RaisePostRequest(configuration, bodyContent, DeleteResultsPath);
        }

        


        

        

        
    }
}
