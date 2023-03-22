using NationalInstruments.SystemLink.Clients.Core;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace NationalInstruments.SystemLink.Clients.Examples.TestMonitor.DeleteResults
{
    public class TestMonitorHttpClient
    {
        /// <summary>
        /// calls the delete request
        /// </summary>
        /// <param name="configuration">A HttpConfiguration object containing base url and api_key</param>
        /// <param name="bodyContent">request body</param>
        /// <param name="requestUriPath">Uri path</param>
        /// <returns>Http response message after calling the API</returns>
        public static HttpResponseMessage RaisePostRequest(IHttpConfiguration configuration, object bodyContent, string requestUriPath)
        {
            HttpClient client = GetHttpClient(configuration);

            var body = GeneratePostRequestBody(bodyContent);

            var response = client.PostAsync(requestUriPath, body).Result;
            CheckForSuccessResponse(response);

            return response;
        }

        /// <summary>
        /// calls the post request
        /// </summary>
        /// <param name="configuration">A HttpConfiguration object containing base url and api_key</param>
        /// <param name="requestUri">Uri route</param>
        /// <returns>Http reponse message after calling the API</returns>
        public static HttpResponseMessage RaiseDeleteRequest(IHttpConfiguration configuration, string requestUri)
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

        /// <summary>
        /// generates the body for the post request
        /// </summary>
        /// <param name="content">an object representing what to there in the body</param>
        /// <returns>A string content which can be used as a body for the post request</returns>
        private static StringContent GeneratePostRequestBody(object content)
        {
            return new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");
        }
    }
}
