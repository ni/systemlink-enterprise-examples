using NationalInstruments.SystemLink.Clients.Core;
using NationalInstruments.SystemLink.Clients.Core.Extensions;
using NationalInstruments.SystemLink.Clients.TestMonitor;
using NationalInstruments.SystemLink.Clients.TestMonitor.Swagger.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Delete_Results
{
    static class Extensions
    {
        public static HttpResponseMessage DeleteResultAsync(this TestDataManager testDataManager, IHttpConfiguration configuration, string resultId, bool? deleteSteps = true)
        {
            if (resultId == null)
            {
                throw new ApiException("Missing required parameter 'resultId' when calling ResultsApi->DeleteResultV2");
            }
            string path = $"nitestmonitor/v2/results/{resultId}?deleteSteps={deleteSteps}";

            HttpClient client = GetHttpClient(configuration);

            var response = client.DeleteAsync(path).Result;
            response.EnsureSuccessStatusCode();
            return response;
        }


        public static HttpResponseMessage DeleteResultsAsync(this TestDataManager testDataManager, IHttpConfiguration configuration, List<string> resultIds, bool? deleteSteps = true)
        {
            if(resultIds.Count == 0)
            {
                throw new ApiException("ids is a required property for DeleteResultsRequest and cannot be null");
            }
            string path = $"nitestmonitor/v2/delete-results";

            var content = new
            {
                Ids = resultIds.ToArray(),
                DeleteSteps = deleteSteps
            };

            var body = new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");

            HttpClient client = GetHttpClient(configuration);

            var response = client.PostAsync(path, body).Result;
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
