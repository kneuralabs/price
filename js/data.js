/* Static catalog: roles and engagement modules. No mutable state here. */
export const ROLES=[
  {abbr:'PTR',name:'Partner / Practice Lead',    note:'Executive sponsor, board-level',        rate:500},
  {abbr:'DIR',name:'AI Governance Director',      note:'Program lead, framework architect',     rate:200},
  {abbr:'SRC',name:'Senior Consultant',           note:'Workstream lead, policy & risk design', rate:100},
  {abbr:'CON',name:'Consultant',                  note:'Execution, documentation, analysis',    rate:90},
  {abbr:'TML',name:'Technical / ML Specialist',   note:'Model risk, bias testing, controls',    rate:80},
  {abbr:'LEG',name:'Legal / Compliance SME',      note:'EU AI Act, NIST RMF, ISO 42001',        rate:70},
  {abbr:'ANL',name:'Analyst',                     note:'Research, inventory, support',          rate:60},
];
export const MODS=[
  {id:'M1', name:'AI Maturity & Readiness Assessment',       dur:'3–4 wks',  h:[8,24,60,80,16,8,40]},
  {id:'M2', name:'Governance Framework & Operating Model',   dur:'4–6 wks',  h:[12,60,100,80,0,24,24]},
  {id:'M3', name:'Policies, Standards & Acceptable Use',     dur:'4–6 wks',  h:[4,20,80,100,0,40,16]},
  {id:'M4', name:'AI Risk Management & Risk Register',       dur:'6–8 wks',  h:[8,40,120,120,40,32,40]},
  {id:'M5', name:'AI Inventory & Model Cataloging',          dur:'4–5 wks',  h:[4,16,60,120,60,0,80]},
  {id:'M6', name:'Regulatory Mapping (EU AI Act/NIST/ISO)',  dur:'3–4 wks',  h:[4,24,60,60,0,80,24]},
  {id:'M7', name:'Model Risk, Bias & Fairness Testing',      dur:'4–6 wks',  h:[4,20,60,60,160,8,40]},
  {id:'M8', name:'Controls Implementation & Tooling',        dur:'8–12 wks', h:[4,32,100,160,120,8,40]},
  {id:'M9', name:'Training, Change Mgmt & Communications',   dur:'4–6 wks',  h:[4,16,60,100,0,8,24]},
  {id:'M10',name:'Monitoring & Managed Service (per qtr)',   dur:'Quarterly',h:[4,24,60,80,40,16,40]},
  {id:'M11',name:'IT Modernization & Cloud Foundations',     dur:'12–20 wks',h:[40,120,200,240,400,60,80]},
];
