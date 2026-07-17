enable_visa_util_64:
  reg.present:
  - name: HKLM\SOFTWARE\National Instruments\SystemSettings\nivisaDeviceUtilizationTracking
  - vname: Value
  - vdata: false
  - vtype: REG_SZ

enable_visa_util_32:
  reg.present:
  - name: HKLM\SOFTWARE\WOW6432Node\National Instruments\SystemSettings\nivisaDeviceUtilizationTracking
  - vname: Value
  - vdata: false
  - vtype: REG_SZ
