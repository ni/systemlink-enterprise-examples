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

            return CallDeleteResultApi(configuration, path);
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

            var body = GeneratePostRequestBody(bodyContent);

            return CallDeleteResultsApi(configuration, body);
        }

        /// <summary>
        /// calls the delete result API
        /// </summary>
        /// <param name="configuration">A HttpConfiguration object containing base url and api_key</param>
        /// <param name="requestUri">Uri route</param>
        /// <returns>Http reponse message after calling the API</returns>
        private static HttpResponseMessage CallDeleteResultApi(IHttpConfiguration configuration, string requestUri)
        {
            HttpClient client = GetHttpClient(configuration);

            var response = client.DeleteAsync(requestUri).Result;
            CheckForSuccessResponse(response);

            return response;
        }

        private static void CheckForSuccessResponse(HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException("Error occured while deleting the result/results. Please check for the correct result Id/Ids");
            }
        }

        /// <summary>
        /// generates the body for the post request
        /// </summary>
        /// <param name="content">an object representing what to there in the body</param>
        /// <returns>A string content which can be used as a body for the post request</returns>
        private static StringContent GeneratePostRequestBody(object content)
        {
            return new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");
        }

        /// <summary>
        /// calls the delete results APi
        /// </summary>
        /// <param name="configuration">A HttpConfiguration object containing base url and api_key</param>
        /// <param name="body">request body</param>
        /// <returns>Http response message after calling the API</returns>
        private static HttpResponseMessage CallDeleteResultsApi(IHttpConfiguration configuration, HttpContent body)
        {
            HttpClient client = GetHttpClient(configuration);

            var response = client.PostAsync(DeleteResultsPath, body).Result;
            CheckForSuccessResponse(response);

            return response;
        }

        /// <summary>
        /// Generates the Http client for making the request
        /// </summary>
        /// <param name="configuration">A HttpConfiguration object containing base url and api_key</param>
        /// <returns>HttpClient</returns>
        private static HttpClient GetHttpClient(IHttpConfiguration configuration)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(configuration.ServerUri.AbsoluteUri);
            client.DefaultRequestHeaders.Add("x-ni-api-key", configuration.ApiKeys["x-ni-api-key"]);

            return client;
        }
    }
}
