const express = require('express')
const router = express.Router()
const ResponseWithDate = [
  {
    id: '67da3ceb-af3f-46d4-9415-fead14603151',
    name: 'Acceptance',
    rangeTimeFrom: '2025-11-15T13:30:56.50Z', // 2025-11-15 __at__ 13:30
    updatedAt: '2025-11-10 17:40:56', // 2025-11-10 __at__ 17:40
    rangeTimeTo: '2025-11-29T23:20:08.072Z', // 2025-11-29 __at__ 23:20
  },
  {
    id: '50e51def-06c5-4aea-b260-3af45181c70f',
    name: 'arefTest',
    rangeTimeFrom: '2022-02-11T15:57:49.589675Z',
    updatedAt: '2025-02-10 17:57:49',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '5c370cd8-5d2b-45b2-a430-206f19cb142b',
    name: 'ghada',
    rangeTimeFrom: '2014-06-01T11:21:17.754000Z',
    updatedAt: '2025-02-13 13:44:51',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '12eb42ef-956e-42f2-9947-b9b3f94aaa82',
    name: 'QC Testing Week',
    rangeTimeFrom: '2021-02-11T18:18:32.069513Z',
    updatedAt: '2025-02-10 20:18:32',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: 'aaf42688-fd4c-4e99-9eb9-e9edcd9a8c7a',
    name: 'check23 feb',
    rangeTimeFrom: '2020-02-25T08:59:06.848086Z',
    updatedAt: '2025-02-23 10:59:06',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '170667bc-bbf8-4738-a81a-34d74681a3a9',
    name: '23feb',
    rangeTimeFrom: '2020-02-25T12:45:06.232898Z',
    updatedAt: '2025-02-23 14:45:06',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '5b7afb1c-7c93-4b51-8780-632d3a0131e8',
    name: '24 feb',
    rangeTimeFrom: '2020-02-26T07:19:37.495918Z',
    updatedAt: '2025-02-24 09:19:37',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: 'f0c8c14a-ddc2-4f7a-b4c7-b741c32bbefa',
    name: 'test_create',
    rangeTimeFrom: '2020-03-06T18:29:26.171349Z',
    updatedAt: '2025-03-05 20:29:26',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: 'e7da6218-6757-4599-b920-6774c8c5f8db',
    name: 'NOKIA/HU Main K',
    rangeTimeFrom: '2024-03-04T12:13:25.086000Z',
    updatedAt: '2025-06-02 22:15:27',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: 'ba31fbd9-b882-4030-9bd7-ce20d527182c',
    name: 'Acceptance repo',
    rangeTimeFrom: '2022-04-28T09:57:08.973425Z',
    updatedAt: '2025-04-27 12:57:08',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '69e8e929-a901-408f-8a06-7f6b6405f83b',
    name: 'acceptance new',
    rangeTimeFrom: '1925-06-13T22:41:36.555554Z',
    updatedAt: '2025-05-20 01:41:36',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '8a7d9492-0fd6-492a-8add-6e4fe1735f94',
    name: 'ahmed accespt t',
    rangeTimeFrom: '1925-07-13T19:53:08.547679Z',
    updatedAt: '2025-06-18 22:53:08',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: 'af0eae27-b27e-4ecf-a111-fe2f18f63210',
    name: 'acceptance new1',
    rangeTimeFrom: '1925-07-23T23:31:01.127808Z',
    updatedAt: '2025-06-29 02:31:01',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '1cc33b6e-b0e1-4ce5-a617-fcaac5533164',
    name: 'acceptance new',
    rangeTimeFrom: '1925-12-24T07:31:33.460132Z',
    updatedAt: '2025-11-29 09:31:33',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
  {
    id: '7acf7bd9-2dd9-4f7b-8244-2f8c4688bf32',
    name: 'Validate Genera',
    rangeTimeFrom: '1925-11-09T02:03:29.023535Z',
    updatedAt: '2025-10-15 05:03:29',
    rangeTimeTo: '2025-11-29T23:32:08.073Z',
  },
]

const ResponseAlarmViewer = [
  {
    "alarm_id": 1213,
    "vendor": "huawei",
    "AlarmLogID": 14743308,
    "alarmTime": "2024-07-19T23:04:46",
    "alarmName": "Mains Input Out of Range",
    "AlarmID": 25622,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Allunghari",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 18 minutes",
    "has_ticket": 64,
    "alerts": []
  },
  {
    "alarm_id": 1217,
    "vendor": "huawei",
    "AlarmLogID": 14742197,
    "alarmTime": "2024-07-19T23:02:25",
    "alarmName": "Data Configuration Exceeding Licensed Limit",
    "AlarmID": 26819,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Numuyel",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 21 minutes",
    "has_ticket": 65,
    "alerts": []
  },
  {
    "alarm_id": 1218,
    "vendor": "huawei",
    "AlarmLogID": 14741665,
    "alarmTime": "2024-07-19T23:01:26",
    "alarmName": "Data Configuration Exceeding Licensed Limit",
    "AlarmID": 26819,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Numuyel",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 22 minutes",
    "has_ticket": 66,
    "alerts": []
  },
  {
    "alarm_id": 1219,
    "vendor": "huawei",
    "AlarmLogID": 14741516,
    "alarmTime": "2024-07-19T23:01:16",
    "alarmName": "Data Configuration Exceeding Licensed Limit",
    "AlarmID": 26819,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Numuyel",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 22 minutes",
    "has_ticket": 67,
    "alerts": []
  },
  {
    "alarm_id": 1231,
    "vendor": "huawei",
    "AlarmLogID": 14740200,
    "alarmTime": "2024-07-19T22:58:52",
    "alarmName": "Data Configuration Exceeding Licensed Limit",
    "AlarmID": 26819,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 24 minutes",
    "has_ticket": 68,
    "alerts": []
  },
  {
    "alarm_id": 1232,
    "vendor": "huawei",
    "AlarmLogID": 14740197,
    "alarmTime": "2024-07-19T22:58:51",
    "alarmName": "Licensed Feature Unusable",
    "AlarmID": 26816,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 24 minutes",
    "has_ticket": 69,
    "alerts": []
  },
  {
    "alarm_id": 1233,
    "vendor": "huawei",
    "AlarmLogID": 14740196,
    "alarmTime": "2024-07-19T22:58:51",
    "alarmName": "License on Trial",
    "AlarmID": 26817,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 24 minutes",
    "has_ticket": 70,
    "alerts": []
  },
  {
    "alarm_id": 1246,
    "vendor": "huawei",
    "AlarmLogID": 14730502,
    "alarmTime": "2024-07-19T22:43:05",
    "alarmName": "Data Configuration Exceeding Licensed Limit",
    "AlarmID": 26819,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 40 minutes",
    "has_ticket": 71,
    "alerts": []
  },
  {
    "alarm_id": 1247,
    "vendor": "huawei",
    "AlarmLogID": 14730499,
    "alarmTime": "2024-07-19T22:43:04",
    "alarmName": "Licensed Feature Unusable",
    "AlarmID": 26816,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 40 minutes",
    "has_ticket": 72,
    "alerts": []
  },
  {
    "alarm_id": 1248,
    "vendor": "huawei",
    "AlarmLogID": 14730498,
    "alarmTime": "2024-07-19T22:43:04",
    "alarmName": "License on Trial",
    "AlarmID": 26817,
    "Severity": 6,
    "NeType": "BTS5900",
    "neName": "Jalambang",
    "Severity_Nokia": null,
    "Acknowledge": "",
    "alarmAging": "16 months, 12 days, 14 hours, 40 minutes",
    "has_ticket": 73,
    "alerts": []
  }
]

const ResponseOnTheFly = [
  {
    "begintime": "2025-02-02",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 95.83,
    "HU LTE_DL Traffic(GB)": 38.3219,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-03",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 26.8652,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-04",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 30.7646,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-05",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 30.4962,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-06",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 25.9001,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-08",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 23.5671,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-10",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 15.6503,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-11",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 28.6537,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-12",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 40.646,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  },
  {
    "begintime": "2025-02-13",
    "ne_name": "4G_BINTUMANI/Cell",
    "ne_type": "eNodeB(4G) : Measurement of Cell Performance",
    "vendor": "Huawei",
    "integrity": 100,
    "HU LTE_DL Traffic(GB)": 32.9074,
    "raw string": "eNodeB Function Name=4G_BINTUMANI,Local Cell ID=3,Cell Name=4G_BINTUMANI-3,eNodeB ID=5006,Cell FDD TDD indication=CELL_FDD"
  }
].map((elm, index) => {
  elm.begintime = elm.begintime + 'T00:00:00.000Z'
  return elm
})

async function GetTable(req, res) {
  try {
    // let updated = ResponseWithDate.map((elm, index) => {
    //   elm.rangeTimeTo = index < 5 ? "2025-12-01T23:58:49.941Z" : index < 10 ? "2025-12-05T01:58:49.941Z" : "2025-12-10T23:58:49.941Z"
    //   delete elm.updatedAt
    //   delete elm.rangeTimeFrom
    //   return elm
    // })
    res.status(200).json({ message: 'success', data: ResponseOnTheFly })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch record' })
  }
}

async function PostPayload(req, res) {
  console.log(req.body)
  try {
    res.status(200).json({ message: 'recieved success' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch record' })
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetTable).post(PostPayload)
module.exports = router
