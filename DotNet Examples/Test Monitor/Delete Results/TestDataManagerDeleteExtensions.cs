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
        public static HttpResponseMessage DeleteResultAsync(this TestDataManager testDataManager, IHttpConfiguration configuration, string resultId, bool? deleteSteps = true)
        {
            if (resultId == null)
            {
                throw new ApiException("Missing required parameter 'resultId' when calling ResultsApi->DeleteResultV2");
            }
            string path = $"{DeleteResultPath}/{resultId}?deleteSteps={deleteSteps}";

            return CallDeleteResultApi(configuration, path);
        }

        private static HttpResponseMessage CallDeleteResultApi(IHttpConfiguration configuration, string requestUri)
        {
            HttpClient client = GetHttpClient(configuration);

            var response = client.DeleteAsync(requestUri).Result;
            response.EnsureSuccessStatusCode();

            return response;
        }


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

            return CallDeleteResultsApi(configuration, DeleteResultsPath, body);
        }

        private static StringContent GeneratePostRequestBody(object content)
        {
            return new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");
        }

        private static HttpResponseMessage CallDeleteResultsApi(IHttpConfiguration configuration, string requestUri, HttpContent body)
        {
            HttpClient client = GetHttpClient(configuration);

            var response = client.PostAsync(DeleteResultsPath, body).Result;
            response.EnsureSuccessStatusCode();

            return response;
        }

        private static HttpClient GetHttpClient(IHttpConfiguration configuration)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(configuration.ServerUri.AbsoluteUri);
            client.DefaultRequestHeaders.Add("x-ni-api-key", configuration.ApiKeys["x-ni-api-key"]);

            return client;
        }
    }
}
