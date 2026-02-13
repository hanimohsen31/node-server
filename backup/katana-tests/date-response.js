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
