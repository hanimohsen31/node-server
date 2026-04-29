const ErrorHandler = require('../middlewares/ErrorHandler')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')
const hpp = require('hpp')
dotenv.config({ path: './.env' })
// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(helmet()) // set security http headers
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(compression())
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour

// In-memory data storage
let rules = []
let nextRuleId = 1

// Initialize with some sample rules
const initializeSampleRules = () => {
  const sampleRules = [
    {
      id: '1',
      ruleName: 'High CPU Alert',
      description: 'Trigger when CPU exceeds threshold',
      applicationScope: 'ipm',
      ruleType: 'alert',
      status: 'active',
      severityLevel: 'critical',
      role: 'admin',
      lastTriggered: '2 days, 5 hours ago',
      formula: 'CPU > 90',
      recipients: [{ email: 'admin@mail.com', role: 'admin' }],
      timeConditions: [],
      evaluation: {
        enabled: true,
        consecutiveChecks: 3,
        checkEvery: { value: 5, unit: 'minutes' },
        coolDown: { value: 30, unit: 'minutes' },
      },
      actions: [],
    },
    {
      id: '2',
      ruleName: 'Memory Usage Warning',
      description: 'Alert when memory usage is high',
      applicationScope: 'all',
      ruleType: 'detection',
      status: 'inactive',
      severityLevel: 'high',
      role: 'member',
      lastTriggered: 'Never',
      formula: 'Memory > 85',
      recipients: [{ email: 'user@mail.com', role: 'member' }],
      timeConditions: [],
      evaluation: {
        enabled: false,
        consecutiveChecks: 2,
        checkEvery: { value: 10, unit: 'minutes' },
        coolDown: { value: 15, unit: 'minutes' },
      },
      actions: [],
    },
    {
      id: '3',
      ruleName: 'Network Latency Spike',
      description: 'Detect network latency issues',
      applicationScope: 'ufm',
      ruleType: 'validation',
      status: 'draft',
      severityLevel: 'medium',
      role: 'viewer',
      lastTriggered: 'Never',
      formula: 'Latency > 100',
      recipients: [],
      timeConditions: [],
      evaluation: {
        enabled: true,
        consecutiveChecks: 1,
        checkEvery: { value: 1, unit: 'minutes' },
        coolDown: { value: 5, unit: 'minutes' },
      },
      actions: [],
    },
    {
      id: '4',
      ruleName: 'Disk Space Critical',
      description: 'Alert when disk space is critically low',
      applicationScope: 'ipm',
      ruleType: 'alert',
      status: 'active',
      severityLevel: 'critical',
      role: 'owner',
      lastTriggered: '1 day, 3 hours ago',
      formula: 'DiskSpace < 10',
      recipients: [{ email: 'admin@mail.com', role: 'admin' }],
      timeConditions: [],
      evaluation: {
        enabled: true,
        consecutiveChecks: 3,
        checkEvery: { value: 15, unit: 'minutes' },
        coolDown: { value: 60, unit: 'minutes' },
      },
      actions: [],
    },
  ]

  let final = [...sampleRules, ...sampleRules, ...sampleRules, ...sampleRules, ...sampleRules, ...sampleRules].map((elm) => {
    return { ...elm, id: Math.floor(Math.random() * 10000).toString() }
  })
  
  final.forEach((rule) => {
    rules.push(rule)
    nextRuleId = Math.max(nextRuleId, parseInt(rule.id) + 1)
  })
}

initializeSampleRules()

// [1] Get realtime cards data
app.get('/api/v1/rule-designer/aggregated-data', (req, res) => {
  const activeRules = rules.filter((r) => r.status === 'active').length
  const totalRules = rules.length
  const triggeredLast24h = Math.floor(Math.random() * 20)
  const criticalAlerts = rules.filter((r) => r.severityLevel === 'critical' && r.status === 'active').length

  res.json({
    success: true,
    data: {
      cards: {
        totalRules: {
          value: totalRules,
          description: 'this month',
          isIncreasing: true,
        },
        activeRules: {
          value: activeRules,
          description: 'enabled today',
          isIncreasing: true,
        },
        triggeredLast24h: {
          value: triggeredLast24h,
          description: '% vs yesterday',
          isIncreasing: triggeredLast24h > 10,
        },
        criticalAlerts: {
          value: criticalAlerts,
          description: 'resolved',
          isIncreasing: false,
        },
      },
    },
    error: null,
  })
})

// [2] Get table rules list with filtering and pagination
app.post('/api/v1/rule-designer/list', (req, res) => {
  let { page = 1, pageSize = 10, search = '', filtering } = req.body.searchParams || {}

  let filteredRules = [...rules]

  // Apply search
  if (search) {
    filteredRules = filteredRules.filter(
      (rule) => rule.ruleName.toLowerCase().includes(search.toLowerCase()) || rule.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Apply filters
  if (filtering && filtering.filter) {
    filtering.filter.forEach((filter) => {
      if (filter.name === 'ruleName' && filter.value) {
        if (filter.operator === 'startswith') {
          filteredRules = filteredRules.filter((rule) => rule.ruleName.toLowerCase().startsWith(filter.value.toLowerCase()))
        }
      } else if (filter.name === 'status' && filter.value) {
        filteredRules = filteredRules.filter((rule) => filter.value.includes(rule.status))
      }
    })
  }

  // Apply sorting
  if (filtering && filtering.sort) {
    filtering.sort.forEach((sort) => {
      filteredRules.sort((a, b) => {
        const aVal = a[sort.selector] || ''
        const bVal = b[sort.selector] || ''
        if (sort.desc) {
          return bVal > aVal ? 1 : -1
        } else {
          return aVal > bVal ? 1 : -1
        }
      })
    })
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize
  const paginatedRules = filteredRules.slice(startIndex, startIndex + pageSize)

  res.json({
    success: true,
    data: {
      items: paginatedRules,
      pagination: {
        total: filteredRules.length,
        pageNumber: page,
        pageSize: pageSize,
      },
    },
    error: null,
  })
})

// [3] Bulk update rules status
app.put('/api/v1/rule-designer/bulk-status', (req, res) => {
  const { rules: ruleIds, status } = req.body
  let affectedCount = 0

  ruleIds.forEach((ruleId) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (rule) {
      rule.status = status
      affectedCount++
    }
  })

  res.json({
    success: true,
    data: {
      message: 'Rules updated successfully',
      affected: affectedCount,
    },
    error: null,
  })
})

// [4] Bulk delete rules
app.delete('/api/v1/rule-designer/delete-bulk-rules', (req, res) => {
  const { rules: ruleIds } = req.body
  const initialLength = rules.length

  rules = rules.filter((rule) => !ruleIds.includes(rule.id))
  const affectedCount = initialLength - rules.length

  res.json({
    success: true,
    data: {
      message: 'Rules DELETED successfully',
      affected: affectedCount,
    },
    error: null,
  })
})

// [5] Create new rule
app.post('/api/v1/rule-designer', (req, res) => {
  const newRule = {
    id: String(nextRuleId++),
    ...req.body,
    lastTriggered: 'Never',
    role: req.body.recipients?.[0]?.role || 'member',
  }

  rules.push(newRule)

  res.json({
    success: true,
    data: {
      id: newRule.id,
      message: 'Rule created successfully',
    },
    error: null,
  })
})

// [6] Update rule
app.patch('/api/v1/rule-designer/update/:ruleId', (req, res) => {
  const { ruleId } = req.params
  const ruleIndex = rules.findIndex((r) => r.id === ruleId)

  if (ruleIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      error: 'Rule not found',
    })
  }

  rules[ruleIndex] = {
    ...rules[ruleIndex],
    ...req.body,
    id: ruleId,
  }

  res.json({
    success: true,
    data: {
      id: ruleId,
      message: 'Rule updated successfully',
    },
    error: null,
  })
})

// [7] Get rule by ID
app.get('/api/v1/rule-designer/get/:ruleId', (req, res) => {
  const { ruleId } = req.params
  const rule = rules.find((r) => r.id === ruleId)

  if (!rule) {
    return res.status(404).json({
      success: false,
      data: null,
      error: 'Rule not found',
    })
  }

  res.json({
    success: true,
    data: rule,
    error: null,
  })
})

// [8] Validate emails
app.post('/api/v1/rule-designer/users-validator', (req, res) => {
  const { emails } = req.body
  const validEmails = []
  const invalidEmails = []

  // Mock validation - consider emails with @mail.com as valid
  emails.forEach((emailObj) => {
    if (emailObj.email.includes('@mail.com') || emailObj.email.includes('@company.com')) {
      validEmails.push(emailObj)
    } else {
      invalidEmails.push(emailObj)
    }
  })

  res.json({
    success: true,
    data: {
      valid: validEmails,
      invalid: invalidEmails,
    },
    error: null,
  })
})

// [9] Get alarm attributes for formula
app.post('/api/v1/rule-designer/alarm-attributes', (req, res) => {
  const { applicationScope } = req.body

  const attributes = [
    {
      label: 'Performance KPIs',
      items: ['L.Thrp.bits.DL', 'L.Thrp.bits.UL', 'L.RRC.ConnEstabAtt', 'RSRP', 'RSRQ', 'SINR'],
    },
    {
      label: 'Alarm Attributes',
      items: ['alarm_type', 'AlarmCount', 'AlarmSeverity', 'PerceivedSeverity'],
    },
    {
      label: 'Transport',
      items: ['LinkUtilization', 'Latency', 'PacketLoss'],
    },
  ]

  res.json({
    success: true,
    data: {
      data: attributes,
      message: 'success',
    },
    error: null,
  })
})

// [10] Get alarm attribute values
app.post('/api/v1/rule-designer/alarm-attributes-values', (req, res) => {
  const { applicationScope, alarmAttributeLabel, alarmAttributeItem } = req.body

  // Mock different responses based on the attribute
  let values
  if (alarmAttributeItem === 'alarm_type') {
    values = ['0', '50', '80', '90', '95', '100']
  } else if (alarmAttributeItem === 'RSRP') {
    values = [{ label: 'RSRP', items: ['-80', '-95', '-110'] }]
  } else {
    values = [{ label: 'Strings', items: ["'LINK_FAILURE'", "'CRITICAL'", "'WARNING'"] }]
  }

  res.json({
    success: true,
    data: {
      data: values,
    },
    error: null,
  })
})

// [11] Check formula validity
app.post('/api/v1/rule-designer/check-formula', (req, res) => {
  const { formula } = req.body

  // Simple validation - check if formula has valid structure
  const hasValidStructure = /[A-Za-z]+\s*[><=!]+\s*\d+/.test(formula)

  res.json({
    success: true,
    data: {
      isValid: hasValidStructure,
      errors: hasValidStructure ? [] : ['Invalid formula syntax'],
    },
    error: null,
  })
})

// [12] Get human preview of formula
app.post('/api/v1/rule-designer/human-preview', (req, res) => {
  const { formula, timeConditions } = req.body

  // Convert formula to human-readable text
  let humanPreview = formula
    .replace(/>/g, 'is greater than')
    .replace(/</g, 'is less than')
    .replace(/>=/g, 'is greater than or equal to')
    .replace(/<=/g, 'is less than or equal to')
    .replace(/==/g, 'equals')
    .replace(/!=/g, 'does not equal')

  // Add time conditions to preview
  if (timeConditions && timeConditions.length > 0) {
    humanPreview += ' with conditions: '
    const conditionTexts = timeConditions.map((tc) => {
      if (tc.type === 'occurrenceCount') {
        return `occurring ${tc.operator === 'gt' ? 'more than' : tc.operator} ${tc.value} times within ${tc.timewithin} ${tc.unit}`
      } else if (tc.type === 'duration') {
        return `lasting ${tc.operator === 'gt' ? 'more than' : tc.operator} ${tc.value} ${tc.unit}`
      } else if (tc.type === 'timeOfDay') {
        return `between ${tc.start} and ${tc.end} (${tc.timeZone})`
      } else if (tc.type === 'dayOfWeek') {
        return `on ${tc.days.join(', ')}`
      } else if (tc.type === 'dateRange') {
        return `from ${tc.start} to ${tc.end}`
      }
      return ''
    })
    humanPreview += conditionTexts.join(', ')
  }

  res.json({
    success: true,
    data: {
      humanPreview: humanPreview,
    },
    error: null,
  })
})

// [13] Get acknowledged by list
app.get('/api/v1/rule-designer/acknowledged-by', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [
        { value: 'john.doe', label: 'John Doe' },
        { value: 'jane.smith', label: 'Jane Smith' },
        { value: 'bob.johnson', label: 'Bob Johnson' },
      ],
    },
    error: null,
  })
})

// [14] Get tickets assignees
app.get('/api/v1/rule-designer/tickets-assignees', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [
        { id: 'u1', displayName: 'Jane Smith', username: 'jane.smith' },
        { id: 'u2', displayName: 'John Doe', username: 'john.doe' },
        { id: 'u3', displayName: 'Alice Brown', username: 'alice.brown' },
      ],
    },
    error: null,
  })
})

// [1] Get realtime cards data
app.get('/ipm-server/api/user/favorites', (req, res) => {
  res.json({
    success: true,
    data: {
      list: ['06f870ec-3c40-4174-8f63-df9fd551825b'],
    },
    message: null,
    error: null,
  })
})

app.get('/ipm-server/api/check_auth', (req, res) => {
  res.json({
    data: {
      id: '37dea9ca-73ee-48e5-82ae-73a16c15f49b',
      email: 'master@katana.com',
      name: 'master',
      roleName: 'superAdmin',
      isMenuHorizontal: false,
      specificPrivileges: {
        maxQuerySizes: 1024,
      },
      modules: [
        {
          id: '5cfe004a-22eb-4a94-be93-e08ccaf23f47',
          name: 'user',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.320696Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'd262ab18-c7b8-48b4-be4d-6cb01a95c56d',
          name: 'group',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.331957Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'a5402953-f266-4e90-8896-cd290178c366',
          name: 'userManagement',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.343216Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '06f870ec-3c40-4174-8f63-df9fd551825b',
          name: 'multi_vendor_dashboard',
          count: 7,
          expiryDate: '2052-02-10T13:28:44.433409Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '9b7cd2ef-600e-4e51-a27c-0ff6284b9a74',
          name: 'multiVendorsMapping',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.388295Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '5a3331a4-4d90-4817-b0a9-7416728edf56',
          name: 'dashboard',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.422179Z',
          maxCounter: 100,
          parentId: '4ec6f302-834b-4d99-8cd2-82ab9692fc82',
          parentName: null,
        },
        {
          id: '5187e960-5b07-4d76-8253-7b9058364446',
          name: 'Ipm',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.557508Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '5402953-f266-4e90-8896-cd290178c477',
          name: 'scheduler',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.354486Z',
          maxCounter: 100,
          parentId: '58b82bfd-ff57-4c7e-bf4d-421395143f4c',
          parentName: null,
        },
        {
          id: '1e5aa550-dc52-11ed-afa1-0242ac120002',
          name: 'benchmark_report',
          count: 8,
          expiryDate: '2052-02-10T13:28:44.783841Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          name: 'MultiVendorAnalytics',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.568752Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: '6a8ab010-70cb-4bac-bec4-76a4d572c113',
          name: 'home',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.591272Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          name: 'MultiVendorReportingSuite',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.602494Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: 'f8ecfe58-d69b-412b-be60-63f3d43ba4ce',
          name: 'physical_data',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.658679Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: 'a004fe50-a9c8-4dcd-849c-cfb65967b784',
          name: 'integration_data',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.681307Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: '11c41174-04f1-464c-bca3-09eaa775ea33',
          name: 'ai_insights',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.716214Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd863a212-a552-11ed-b9df-0242ac120003',
          name: 'capacity_impact',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.761257Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: '95b35048-bdb2-11ed-afa1-0242ac120452',
          name: 'counters_configuration',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.772512Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'c7bf4c66-f9ef-4f01-a401-7196100b8f73',
          name: 'swap_report',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.794978Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd2eef894-b442-4253-9a88-9f109648b3ae',
          name: 'customer_experience',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.806191Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          name: 'ufm',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.817367Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: 'e4b1a32b-56e2-445c-ba01-106be05d59a3',
          name: 'alarm_viewer',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.828669Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '2ea7a774-6550-4dc1-aab7-7d283f70c5b9',
          name: 'ufm_dashboard',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.839864Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '99a9ff05-8971-4b97-8da2-fb482c9733ec',
          name: 'op_commander',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.851095Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: 'f529b1f5-b44f-4e5e-9b26-a7cc7d63f7f9',
          name: 'rule_designer',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.862286Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '1619b1d1-654c-4a1e-8910-f19fb6481043',
          name: 'fault_matric',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.873510Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          name: 'neteye',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.884798Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '023b58a1-2acf-4ae0-a987-bafb85d43fb6',
          name: 'parameter_browser',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.899825Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '6ab9478c-ce93-4c80-abdf-a61cc9809f94',
          name: 'parameter_audits',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.911063Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '794f5fc4-8718-4f7d-9752-bb9520b202d7',
          name: 'network_discrepancy',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.922264Z',
          maxCounter: 100,
          parentId: '6ab9478c-ce93-4c80-abdf-a61cc9809f94',
          parentName: null,
        },
        {
          id: 'e51fd6fe-1a8c-48fa-9afb-269c2dae5b11',
          name: 'topolgy_viewer',
          count: 0,
          expiryDate: '2052-05-04T10:52:26.027614Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '53d472a8-7668-4dfe-86f9-f5005d81ceac',
          name: 'ufm_scheduler',
          count: 0,
          expiryDate: '2052-08-08T12:27:45.666895Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '91129d16-55be-4a73-b595-af284b2148e9',
          name: 'PerformanceMetric',
          count: 22,
          expiryDate: '2052-02-10T13:28:44.377091Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '48e7618d-da44-4ae5-a918-0add2d5880a3',
          name: 'activity_log',
          count: 0,
          expiryDate: '2052-08-08T12:27:45.698871Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '5cca6255-d304-4c5d-89c7-403133385d45',
          name: 'multi_vendor_forecasting',
          count: 11,
          expiryDate: '2052-02-10T13:28:44.750051Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: 'fbcdbe6a-b2bd-46e7-bdfc-085590823421',
          name: 'acceptance_report',
          count: 17,
          expiryDate: '2052-02-10T13:28:44.738822Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '81e5a372-565f-414f-8ff3-6c712141cda3',
          name: 'multi_vendors_wdl',
          count: 12,
          expiryDate: '2052-02-10T13:28:44.535030Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd005b953-4de1-4529-9de0-ef6e4c566f7f',
          name: 'multi_vendors_wcl',
          count: 35,
          expiryDate: '2052-02-10T13:28:44.523761Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '1f8a0953-0b56-4086-9a28-1bc47a556dc3',
          name: 'kpi',
          count: 0,
          expiryDate: '2053-06-22T12:59:19.530315Z',
          maxCounter: 100,
          parentId: '691e3338-b342-49a4-bf0a-40002409020f',
          parentName: null,
        },
        {
          id: '9e09a87a-2936-11ed-a261-0242ac120002',
          name: 'multiVendorsReport',
          count: 60,
          expiryDate: '2052-02-10T13:28:44.410819Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: 'fdg45212-6xg2-2150-dv20-1205hb0ctyld',
          name: 'multiVendorsKpi',
          count: 10,
          expiryDate: '2052-02-10T13:28:44.365701Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '5150ef9d-a837-4359-8734-6cd321c4768c',
          name: 'multi_vendor_anomaly',
          count: 16,
          expiryDate: '2052-02-10T13:28:44.727562Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: 'e1e45719-e93a-44de-bb34-f07db0e91151',
          name: 'MultiVendorScheduler',
          count: 195,
          expiryDate: '2052-02-10T13:28:44.580072Z',
          maxCounter: 10000,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'c79ef385-9bc8-4c02-bc6c-94a78b66a0fc',
          name: 'RuleDesigner',
          count: 15,
          expiryDate: '2052-03-06T12:59:11.172160Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '75f95609-a5e1-4a09-a27d-dbdf517e9294',
          name: 'multiVendorsWorkingSet',
          count: 22,
          expiryDate: '2052-02-10T13:28:44.399538Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '9dd6401a-3cbf-11ed-a261-0242ac120002',
          name: 'multiVendorsQuery',
          count: 4307,
          expiryDate: '2052-02-10T13:28:44.546240Z',
          maxCounter: 100000,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
      ],
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwdWJsaWNfaWQiOiIzN2RlYTljYS03M2VlLTQ4ZTUtODJhZS03M2ExNmMxNWY0OWIiLCJleHAiOjE3NzY1OTE5OTd9.mzLGiLRJb24ZIwbn2TAkJXXGUpc_4Z9TUZBa6c-6JJQ',
    },
    message: null,
  })
})

app.get('/ipm-server/api/LastSuccessfulRun', (req, res) => {
  res.json({
    success: true,
    data: {
      lastSuccessfulRun: '2026-04-19 07:42:05',
    },
    message: null,
    error: null,
  })
})

app.post('/ipm-server/api/users_devices', (req, res) => {
  res.json({
    success: true,
    message: 'device already exists',
    error: null,
  })
})

app.post('/ipm-server/api/login', (req, res) => {
  res.json({
    data: {
      id: '37dea9ca-73ee-48e5-82ae-73a16c15f49b',
      email: 'master@katana.com',
      name: 'master',
      roleName: 'superAdmin',
      isMenuHorizontal: false,
      specificPrivileges: {
        maxQuerySizes: 1024,
      },
      modules: [
        {
          id: '5cfe004a-22eb-4a94-be93-e08ccaf23f47',
          name: 'user',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.320696Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'd262ab18-c7b8-48b4-be4d-6cb01a95c56d',
          name: 'group',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.331957Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'a5402953-f266-4e90-8896-cd290178c366',
          name: 'userManagement',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.343216Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '06f870ec-3c40-4174-8f63-df9fd551825b',
          name: 'multi_vendor_dashboard',
          count: 7,
          expiryDate: '2052-02-10T13:28:44.433409Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '9b7cd2ef-600e-4e51-a27c-0ff6284b9a74',
          name: 'multiVendorsMapping',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.388295Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '5a3331a4-4d90-4817-b0a9-7416728edf56',
          name: 'dashboard',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.422179Z',
          maxCounter: 100,
          parentId: '4ec6f302-834b-4d99-8cd2-82ab9692fc82',
          parentName: null,
        },
        {
          id: '5187e960-5b07-4d76-8253-7b9058364446',
          name: 'Ipm',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.557508Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '5402953-f266-4e90-8896-cd290178c477',
          name: 'scheduler',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.354486Z',
          maxCounter: 100,
          parentId: '58b82bfd-ff57-4c7e-bf4d-421395143f4c',
          parentName: null,
        },
        {
          id: '1e5aa550-dc52-11ed-afa1-0242ac120002',
          name: 'benchmark_report',
          count: 8,
          expiryDate: '2052-02-10T13:28:44.783841Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          name: 'MultiVendorAnalytics',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.568752Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: '6a8ab010-70cb-4bac-bec4-76a4d572c113',
          name: 'home',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.591272Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          name: 'MultiVendorReportingSuite',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.602494Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: 'f8ecfe58-d69b-412b-be60-63f3d43ba4ce',
          name: 'physical_data',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.658679Z',
          maxCounter: 100,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
        {
          id: 'a004fe50-a9c8-4dcd-849c-cfb65967b784',
          name: 'integration_data',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.681307Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: '11c41174-04f1-464c-bca3-09eaa775ea33',
          name: 'ai_insights',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.716214Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd863a212-a552-11ed-b9df-0242ac120003',
          name: 'capacity_impact',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.761257Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: '95b35048-bdb2-11ed-afa1-0242ac120452',
          name: 'counters_configuration',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.772512Z',
          maxCounter: 100,
          parentId: 'a5402953-f266-4e90-8896-cd290178c366',
          parentName: null,
        },
        {
          id: 'c7bf4c66-f9ef-4f01-a401-7196100b8f73',
          name: 'swap_report',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.794978Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd2eef894-b442-4253-9a88-9f109648b3ae',
          name: 'customer_experience',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.806191Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          name: 'ufm',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.817367Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: 'e4b1a32b-56e2-445c-ba01-106be05d59a3',
          name: 'alarm_viewer',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.828669Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '2ea7a774-6550-4dc1-aab7-7d283f70c5b9',
          name: 'ufm_dashboard',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.839864Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '99a9ff05-8971-4b97-8da2-fb482c9733ec',
          name: 'op_commander',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.851095Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: 'f529b1f5-b44f-4e5e-9b26-a7cc7d63f7f9',
          name: 'rule_designer',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.862286Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '1619b1d1-654c-4a1e-8910-f19fb6481043',
          name: 'fault_matric',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.873510Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          name: 'neteye',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.884798Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '023b58a1-2acf-4ae0-a987-bafb85d43fb6',
          name: 'parameter_browser',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.899825Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '6ab9478c-ce93-4c80-abdf-a61cc9809f94',
          name: 'parameter_audits',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.911063Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '794f5fc4-8718-4f7d-9752-bb9520b202d7',
          name: 'network_discrepancy',
          count: 0,
          expiryDate: '2052-02-10T13:28:44.922264Z',
          maxCounter: 100,
          parentId: '6ab9478c-ce93-4c80-abdf-a61cc9809f94',
          parentName: null,
        },
        {
          id: 'e51fd6fe-1a8c-48fa-9afb-269c2dae5b11',
          name: 'topolgy_viewer',
          count: 0,
          expiryDate: '2052-05-04T10:52:26.027614Z',
          maxCounter: 100,
          parentId: null,
          parentName: null,
        },
        {
          id: '53d472a8-7668-4dfe-86f9-f5005d81ceac',
          name: 'ufm_scheduler',
          count: 0,
          expiryDate: '2052-08-08T12:27:45.666895Z',
          maxCounter: 100,
          parentId: '9249db3c-6d94-4ea7-afca-174dba73b8f1',
          parentName: null,
        },
        {
          id: '91129d16-55be-4a73-b595-af284b2148e9',
          name: 'PerformanceMetric',
          count: 22,
          expiryDate: '2052-02-10T13:28:44.377091Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '48e7618d-da44-4ae5-a918-0add2d5880a3',
          name: 'activity_log',
          count: 0,
          expiryDate: '2052-08-08T12:27:45.698871Z',
          maxCounter: 100,
          parentId: '0a3e1a13-9b42-4905-8698-2f29ae8acb59',
          parentName: null,
        },
        {
          id: '5cca6255-d304-4c5d-89c7-403133385d45',
          name: 'multi_vendor_forecasting',
          count: 11,
          expiryDate: '2052-02-10T13:28:44.750051Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: 'fbcdbe6a-b2bd-46e7-bdfc-085590823421',
          name: 'acceptance_report',
          count: 17,
          expiryDate: '2052-02-10T13:28:44.738822Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '81e5a372-565f-414f-8ff3-6c712141cda3',
          name: 'multi_vendors_wdl',
          count: 12,
          expiryDate: '2052-02-10T13:28:44.535030Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'd005b953-4de1-4529-9de0-ef6e4c566f7f',
          name: 'multi_vendors_wcl',
          count: 35,
          expiryDate: '2052-02-10T13:28:44.523761Z',
          maxCounter: 100,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: '1f8a0953-0b56-4086-9a28-1bc47a556dc3',
          name: 'kpi',
          count: 0,
          expiryDate: '2053-06-22T12:59:19.530315Z',
          maxCounter: 100,
          parentId: '691e3338-b342-49a4-bf0a-40002409020f',
          parentName: null,
        },
        {
          id: '9e09a87a-2936-11ed-a261-0242ac120002',
          name: 'multiVendorsReport',
          count: 60,
          expiryDate: '2052-02-10T13:28:44.410819Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: 'fdg45212-6xg2-2150-dv20-1205hb0ctyld',
          name: 'multiVendorsKpi',
          count: 10,
          expiryDate: '2052-02-10T13:28:44.365701Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '5150ef9d-a837-4359-8734-6cd321c4768c',
          name: 'multi_vendor_anomaly',
          count: 16,
          expiryDate: '2052-02-10T13:28:44.727562Z',
          maxCounter: 100,
          parentId: '11c41174-04f1-464c-bca3-09eaa775ea33',
          parentName: null,
        },
        {
          id: 'e1e45719-e93a-44de-bb34-f07db0e91151',
          name: 'MultiVendorScheduler',
          count: 195,
          expiryDate: '2052-02-10T13:28:44.580072Z',
          maxCounter: 10000,
          parentId: 'c3b26d21-bcdf-4df8-805d-0a031e3b2d59',
          parentName: null,
        },
        {
          id: 'c79ef385-9bc8-4c02-bc6c-94a78b66a0fc',
          name: 'RuleDesigner',
          count: 15,
          expiryDate: '2052-03-06T12:59:11.172160Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '75f95609-a5e1-4a09-a27d-dbdf517e9294',
          name: 'multiVendorsWorkingSet',
          count: 22,
          expiryDate: '2052-02-10T13:28:44.399538Z',
          maxCounter: 100,
          parentId: '1e7ddc6b-ffd5-4bb7-8e54-6f52415f0164',
          parentName: null,
        },
        {
          id: '9dd6401a-3cbf-11ed-a261-0242ac120002',
          name: 'multiVendorsQuery',
          count: 4307,
          expiryDate: '2052-02-10T13:28:44.546240Z',
          maxCounter: 100000,
          parentId: '5187e960-5b07-4d76-8253-7b9058364446',
          parentName: null,
        },
      ],
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwdWJsaWNfaWQiOiIzN2RlYTljYS03M2VlLTQ4ZTUtODJhZS03M2ExNmMxNWY0OWIiLCJleHAiOjE3NzY1OTE5OTd9.mzLGiLRJb24ZIwbn2TAkJXXGUpc_4Z9TUZBa6c-6JJQ',
    },
    message: null,
  })
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`server running`)
})
