# ni_data_space_analyzer

This library is used for Analyzing the parametric data from DataSpace and provide analysis results.

## Usage

1.  Install the Data Space Analyzer module by using the below command.

    ```
    pip install ni_data_space_analyzer
    ```

1.  Now import the module by using the below line inside the python script.

    ```python
    import ni_data_space_analyzer
    from ni_data_space_analyzer.constants import AnalysisOptions
    ```

1.  After importing the module, we can use the **load_dataset** function from **data_space_analyzer** to load the dataset with the following syntax. This function will download the artifact file, unzip its contents, and convert the string dataset into the desired format by transforming the data within each trace into a dataframe.

    ```python
    trace_data = {"artifact_id": "<artifact_id>"}
    analysis_options = ["min", "max", "mean", "moving_mean", "2std", "-2std", "cp", "cpk"]
    workspace_id = "<workspace_id>"

    supported_analysis = [
        {"id": "min", "type": "scalar"},
        {"id": "max", "type": "scalar"},
        {"id": "mean", "type": "scalar"},
        {"id": "2std", "type": "scalar"},
        {"id": "-2std", "type": "scalar"},
        {"id": "moving_mean", "type": "vector"},
        {"id": "cp", "type": "vector"},
        {"id": "cpk", "type": "vector"},
    ]

    traces = data_space_analyzer.load_dataset(trace_data)
    ```

1.  After loading the dataset, we can iterate over the traces and get the trace data. We can use **data_space_analyzer** to perform the analysis as shown below.

    ```python
    for trace in traces:
        data_space_analyzer = ni_data_space_analyzer.DataSpaceAnalyzer(dataframe=trace["data"])

        data_space_analyzer.compute_min()
        data_space_analyzer.compute_max()
        data_space_analyzer.compute_mean()
        window_size = 5
        data_space_analyzer.compute_moving_mean(window_size)
        data_space_analyzer.compute_2std()
        data_space_analyzer.compute_negative_2std()
        data_space_analyzer.compute_cp()
        data_space_analyzer.compute_cpk()
    ```

1.  By default the analysis results will be appended to original dataframe, and users can generate the analysis results using **generate_analysis_output** method inside **data_space_analyzer** for the given analysis options and supported analysis as below.

    ```python
    analysis_result = data_space_analyzer.generate_analysis_output(analysis_options, supported_analysis)
    ```

1.  Users can save the analysis results into an artifact using the **save_analysis** method within **data_space_analyzer**. The output will be an artifact ID, representing the compressed and stored analysis data.

    ```python
    output_artifact_result = data_space_analyzer.save_analysis(workspace_id, analysis_result)
    ```

1.  Overall sample python script will be looked like this:

    ```python
    import scrapbook as sb
    import ni_data_space_analyzer
    from ni_data_space_analyzer.constants import AnalysisOptions

    trace_data = {"artifact_id": "<artifact_id>"}
    analysis_options = ["min", "max", "mean", "moving_mean", "2std", "-2std", "cp", "cpk"]
    workspace_id = "<workspace_id>"

    supported_analysis = [
        {"id": "min", "type": "scalar"},
        {"id": "max", "type": "scalar"},
        {"id": "mean", "type": "scalar"},
        {"id": "2std", "type": "scalar"},
        {"id": "-2std", "type": "scalar"},
        {"id": "moving_mean", "type": "vector"},
        {"id": "cp", "type": "vector"},
        {"id": "cpk", "type": "vector"},
    ]

    traces = data_space_analyzer.load_dataset(trace_data)
    final_result = []

    for trace in traces:
        trace_data_name = trace["name"]
        trace_data_dataframe = trace["data"]

        data_space_analyzer = ni_data_space_analyzer.DataSpaceAnalyzer(dataframe=trace_data_dataframe)

        data_space_analyzer.compute_min()
        data_space_analyzer.compute_max()
        data_space_analyzer.compute_mean()
        window_size = 5
        data_space_analyzer.compute_moving_mean(window_size)
        data_space_analyzer.compute_2std()
        data_space_analyzer.compute_negative_2std()
        data_space_analyzer.compute_cp()
        data_space_analyzer.compute_cpk()

        analysis_results = data_space_analyzer.generate_analysis_output(analysis_options, supported_analysis)

        final_result.append({"plot_label": trace_data_name, "data": analysis_results})

    output_artifact_result = data_space_analyzer.save_analysis(workspace_id, final_result)

    sb.glue("result", output_artifact_id)
    ```
