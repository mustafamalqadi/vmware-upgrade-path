const NSX_DATA = {
  product: "NSX",
  icon: "&#127760;",
  color: "#a78bfa",
  versions: [
    { id: "3.1.0", label: "NSX 3.1.0", eol: true, release: "2020-10" },
    { id: "3.1.1", label: "NSX 3.1.1", eol: true, release: "2021-01" },
    { id: "3.1.2", label: "NSX 3.1.2", eol: true, release: "2021-03" },
    { id: "3.1.3", label: "NSX 3.1.3", eol: true, release: "2021-07" },
    { id: "3.2.0", label: "NSX 3.2.0", eol: true, release: "2021-12" },
    { id: "3.2.1", label: "NSX 3.2.1", eol: true, release: "2022-05" },
    { id: "3.2.2", label: "NSX 3.2.2", eol: false, release: "2022-10" },
    { id: "3.2.3", label: "NSX 3.2.3", eol: false, release: "2023-03" },
    { id: "4.0.0", label: "NSX 4.0.0", eol: false, release: "2022-12" },
    { id: "4.0.1", label: "NSX 4.0.1", eol: false, release: "2023-03" },
    { id: "4.1.0", label: "NSX 4.1.0", eol: false, release: "2023-06" },
    { id: "4.1.1", label: "NSX 4.1.1", eol: false, release: "2023-10" },
    { id: "4.1.2", label: "NSX 4.1.2", eol: false, release: "2024-03" },
    { id: "4.2.0", label: "NSX 4.2.0", eol: false, release: "2024-06" },
    { id: "4.2.1", label: "NSX 4.2.1", eol: false, release: "2024-11" }
  ],
  paths: {
    "3.1.0": ["3.1.1"],
    "3.1.1": ["3.1.2"],
    "3.1.2": ["3.1.3"],
    "3.1.3": ["3.2.0", "3.2.1"],
    "3.2.0": ["3.2.1", "3.2.2", "3.2.3"],
    "3.2.1": ["3.2.2", "3.2.3", "4.0.0", "4.0.1"],
    "3.2.2": ["3.2.3", "4.0.1", "4.1.0"],
    "3.2.3": ["4.0.1", "4.1.0", "4.1.1"],
    "4.0.0": ["4.0.1", "4.1.0"],
    "4.0.1": ["4.1.0", "4.1.1", "4.1.2"],
    "4.1.0": ["4.1.1", "4.1.2", "4.2.0"],
    "4.1.1": ["4.1.2", "4.2.0"],
    "4.1.2": ["4.2.0", "4.2.1"],
    "4.2.0": ["4.2.1"],
    "4.2.1": []
  },
  preChecks: {
    _default: [
      "<strong>Upgrade Order (CRITICAL):</strong> NSX upgrade order MUST be: 1) NSX Manager Cluster → 2) Edge Nodes → 3) Host Transport Nodes. NEVER reverse this order. Upgrading hosts before Manager = potential data plane outage. Verify current versions: System > Upgrade > Upgrade Plan shows component order",
      "<strong>Pre-Upgrade Checks:</strong> In NSX Manager UI: System > Upgrade > Run Pre-Checks. This validates: disk space, connectivity, configuration compatibility, deprecated features. Resolve ALL blocking (red) issues. Yellow warnings: assess risk but may be acceptable. Re-run until clean",
      "<strong>Manager Cluster Health:</strong> API: GET /api/v1/cluster/status. Response must show: 'control_cluster_status': 'STABLE', 'mgmt_cluster_status': 'STABLE'. All 3 nodes must be online. If DEGRADED: System > Appliances > check individual node status. Fix before upgrade — never upgrade degraded cluster",
      "<strong>Edge Node Status:</strong> Fabric > Edge Transport Nodes. Every Edge must show: Admin State = Enabled, Deployment Status = Node Ready, Manager Connectivity = Up. If any Edge is disconnected: SSH to Edge > get interface eth0 (check IP), get managers (check Manager connectivity). Fix before proceeding",
      "<strong>Host Transport Nodes:</strong> Fabric > Host Transport Nodes. All hosts must show Configuration State = 'Success' and Transport Node State = 'Up'. If 'Failed' or 'In Progress': check host's NSX VIBs: esxcli software vib list | grep nsx. Resolve by re-preparing host or removing/re-adding",
      "<strong>Configuration Backup:</strong> System > Backup & Restore > Backup Now. Target: remote SFTP server (NOT local to NSX Manager). Verify backup completes successfully and file is accessible on SFTP. Record backup filename/timestamp. This is your rollback point if upgrade fails catastrophically",
      "<strong>Disk Space:</strong> SSH to each NSX Manager node: df -h /. Minimum 50GB free required. Also check: df -h /image (upgrade staging area). If low: clear old upgrade bundles: rm /image/upgrade_bundles/*.mub (old bundles only). Never delete current running image files",
      "<strong>Active Alarms:</strong> System > Alarms. Filter by severity: Critical, High. Each alarm must be investigated and resolved OR documented as known/acceptable. Common pre-upgrade blockers: certificate expiry, backup failure, Edge datapath down. Clear resolved alarms to reduce noise",
      "<strong>Controller Status:</strong> System > Fabric > Nodes > Controllers tab. All controllers must show 'Connected' status. For NSX-T 3.x: controllers are co-located with Manager. Check: GET /api/v1/cluster/nodes — all node_status entries should be 'CONNECTED'. If not: check inter-node network (port 7777)",
      "<strong>DFW Configuration Export:</strong> Security > Distributed Firewall > Actions > Export. Save configuration as JSON/XML. Also via API: GET /policy/api/v1/infra/domains/default/security-policies. Document rule count per section. This serves as both backup and audit trail for post-upgrade validation",
      "<strong>Routing Protocol Status:</strong> SSH to Edge Node: get bgp neighbor summary (shows all BGP peers and state). All peers should show 'Estab' state. Also: get route — verify expected routes present. If using OSPF: get ospf neighbor — all should be 'Full'. Document routing table for post-upgrade comparison",
      "<strong>Federation Health:</strong> If using NSX Federation: Global Manager > System > Appliances — GM must be healthy. Each Local Manager site: verify cross-site connectivity. Upgrade GM first, then LMs. If no Federation: skip this check. Federation requires coordinated upgrade across ALL locations",
      "<strong>License Validation:</strong> System > Licenses. Verify license type (Enterprise, Enterprise Plus, etc.) and expiry date. Some NSX 4.x features require Enterprise Plus. If license expires within upgrade window: renew first. Expired license = feature lockout post-upgrade (DFW still works but no new rules)"
    ],
    "3.2.x->4.0": [
      "<strong>Policy-Only Mode:</strong> NSX 4.0 introduces Policy-only mode — Manager API (/api/v1/logical-*) is deprecated. Verify ALL configurations exist in Policy API: GET /policy/api/v1/infra. If objects only exist in Manager API: they must be promoted. Check: System > Configuration > Promoted Objects count",
      "<strong>MP-to-Policy Promotion:</strong> System > Configuration > MP to Policy Migration. This MUST be completed before 4.x upgrade. Promotion converts Manager-API objects to Policy-API equivalents. Run promotion, verify all objects migrated. If promotion fails: check for unsupported configurations (some legacy features can't promote)",
      "<strong>API Script Audit:</strong> Review all automation scripts, Terraform providers, Ansible playbooks for deprecated Manager API calls: /api/v1/logical-switches, /api/v1/logical-routers, /api/v1/logical-ports. Replace with Policy API equivalents: /policy/api/v1/infra/segments, /policy/api/v1/infra/tier-0s, etc. Test in lab first",
      "<strong>NSX Intelligence:</strong> If using NSX Intelligence (Network Detection and Response, Traffic Analysis): verify compatibility with NSX 4.0. Intelligence may require separate upgrade. Check: System > NSX Intelligence > Version. Consult VMware Interoperability Matrix for supported combinations",
      "<strong>Federation Coordination:</strong> For NSX Federation environments: upgrade Global Manager FIRST, then each Local Manager sequentially. Never upgrade LMs in parallel. Verify: GM version ≥ LM version at all times. If GM is unavailable during LM upgrade: cross-site policies won't synchronize",
      "<strong>DFW/NAT Export:</strong> Export all DFW rules: GET /policy/api/v1/infra/domains/default/security-policies (Policy API). Export NAT rules: GET /policy/api/v1/infra/tier-1s/<id>/nat/nat-rules. Save locally AND in version control. This is critical for rollback validation and audit",
      "<strong>Service Insertion Partners:</strong> If using third-party service insertion (Palo Alto, CheckPoint, etc.): verify partner appliance compatibility with NSX 4.0. Check: Security > Network Introspection > Service Chains. Incompatible SI partner = traffic blackhole post-upgrade. Coordinate with partner vendor"
    ],
    "4.0.x->4.1": [
      "<strong>vCenter Version Requirement:</strong> NSX 4.1 REQUIRES vCenter 8.0 or later. Pre-check will FAIL if vCenter is 7.x. Verify: In vCenter, Help > About — must show 8.0.x. If vCenter is 7.x: upgrade vCenter FIRST before attempting NSX 4.1 upgrade. This is a hard dependency",
      "<strong>DFW Rule Optimization:</strong> Security > Distributed Firewall > check total rule count. If > 10,000 rules: performance may degrade during upgrade as rule tables are migrated. Optimize: consolidate overlapping rules, remove unused rules (check hit count = 0), merge duplicate sections. Target: < 5,000 rules",
      "<strong>Gateway Firewall Backup:</strong> Security > Gateway Firewall > each Tier-0/Tier-1 gateway. Export rules via API: GET /policy/api/v1/infra/domains/default/gateway-policies. Gateway FW rules are separate from DFW rules. Back up independently. Verify backup file contains all expected rules before proceeding",
      "<strong>NSX ALB Integration:</strong> If using NSX Advanced Load Balancer (Avi): verify version compatibility with NSX 4.1. Check: NSX ALB Controller > Administration > System Settings > Version. Consult VMware compatibility matrix. NSX ALB may require separate upgrade. Plan sequence: NSX first, then ALB controller",
      "<strong>Edge VM Hardware Version:</strong> In vCenter: select Edge VM > Summary > VM Hardware. Hardware version should be compatible with target ESXi. If Edge VMs are on old hardware version: upgrade VM compatibility after NSX upgrade. Note: do NOT change hardware version during NSX upgrade — only after",
      "<strong>Pending Configuration Changes:</strong> Fabric > Host Transport Nodes and Edge Transport Nodes. Look for any nodes showing 'Configuration Pending' or 'Partially Realized'. These MUST be resolved before upgrade: either re-apply configuration or remove and re-add the transport node. Pending changes = upgrade failure"
    ]
  },
  postChecks: [
    "<strong>Manager Cluster Health:</strong> System > Appliances — all 3 NSX Manager nodes must show 'STABLE' with green status. API: GET /api/v1/cluster/status — verify 'control_cluster_status' and 'mgmt_cluster_status' both return 'STABLE'. If any node shows DEGRADED: check node connectivity, restart nsx-manager service on affected node",
    "<strong>Edge Node Versions:</strong> Fabric > Edge Transport Nodes. Every Edge must show new version number in 'Version' column. If any Edge still shows old version: upgrade may have failed for that node. Check: System > Upgrade > History for errors. Re-trigger Edge upgrade for failed nodes individually",
    "<strong>Host Transport Node State:</strong> Fabric > Host Transport Nodes. All hosts must show Configuration State = 'Success' and Manager Connectivity = 'Up'. If 'Failed': SSH to ESXi host > esxcli software vib list | grep nsx — verify new VIB version. If old version: re-trigger host upgrade from NSX Manager",
    "<strong>DFW Rule Validation:</strong> Security > Distributed Firewall. Verify: rule count matches pre-upgrade documented count, no rules missing, hit counters incrementing for active rules. Test: generate traffic between VMs in different security groups and verify allow/deny matches expected policy",
    "<strong>East-West Traffic:</strong> From VM-A on Host-1: ping VM-B on Host-2 (same NSX segment). Should succeed with < 2ms latency. If fails: check host TEP connectivity, verify GENEVE tunnel is up between hosts. SSH to host: nsxdp-cli tunnels get — should show active tunnels to peer hosts",
    "<strong>North-South Traffic:</strong> From VM inside NSX segment: ping external destination (e.g., 8.8.8.8 or corporate gateway). Traffic traverses Tier-0/1 gateway via Edge Node. If fails: check Edge datapath: SSH to Edge > get interfaces — verify uplink has IP. get route — verify default route present",
    "<strong>Load Balancer VIPs:</strong> If NSX LB configured: curl -k https://<vip>:<port> from external client. Should return expected response. In NSX: Networking > Load Balancing > Virtual Servers — status should show 'Up' with healthy pool members. If down: check pool member health monitors",
    "<strong>BGP/OSPF Peering:</strong> SSH to Edge Node: get bgp neighbor summary. All peers must show state 'Estab' (Established). If 'Active' or 'Idle': BGP session is down. Check: get bgp neighbor <ip> detail — look for reason. Common: timer mismatch, password mismatch, interface down post-upgrade",
    "<strong>NAT Functionality:</strong> Test SNAT: from internal VM, access external resource — verify source IP shows as NAT'd IP (check on firewall or target server). Test DNAT: from external, access VIP — verify reaches correct internal VM. If NAT broken: Networking > NAT > verify rules present and bound to correct gateway",
    "<strong>API Responsiveness:</strong> time curl -sk https://<nsx-manager>/api/v1/cluster/status. Should return in < 2 seconds. If slow (> 5 seconds): check NSX Manager CPU/memory: SSH > top. If overloaded: investigate — large DFW rule tables or excessive API polling may cause slowness after upgrade",
    "<strong>Micro-Segmentation Enforcement:</strong> Security > Distributed Firewall > select active section > check 'Statistics' column. Hit counts should increment for actively used rules. If all zeros after upgrade: DFW may not be enforced. Check host: nsxdp-cli firewall rules get — verify rules pushed to datapath",
    "<strong>VPN Tunnel Status:</strong> If using IPSec/L2VPN: Networking > VPN > IPSec Sessions. Status must show 'Up' (green). If down: check IKE/ESP SA negotiation: SSH to Edge > get ipsec sa. Common issue: crypto algorithm renegotiation after upgrade. Verify peer side hasn't changed settings"
  ],
  upgradeOrder: [
    { step: 1, component: "NSX Manager Cluster", desc: "Upgrade all 3 NSX Manager nodes (rolling, one at a time)", downtime: "No control-plane downtime if 3-node cluster" },
    { step: 2, component: "Edge Nodes", desc: "Upgrade Edge Nodes in each Edge Cluster (one at a time with failover)", downtime: "2-5 seconds per Edge failover event" },
    { step: 3, component: "Host Transport Nodes", desc: "Upgrade NSX VIBs on all ESXi hosts (can be done per cluster)", downtime: "No data-plane downtime if using rolling upgrade" }
  ],
  knownIssues: {
    "4.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-17' target='_blank'>KB #17 — NTP / Time Drift</a>: NSX Manager nodes may fail to form cluster if time skew exceeds 5 seconds after upgrade. Verify NTP sync across all nodes.",
    "4.1": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-11' target='_blank'>KB #11 — Certificate Issues</a>: Edge Node certificates may expire during extended upgrade windows. Renew certs before starting if expiry is within 30 days."
  },
  estimatedDowntime: {
    _default: "Near-zero (rolling upgrade with failover)",
    edge_failover: "2-5 seconds per Edge Node failover",
    full_cluster: "60-90 min for complete environment upgrade"
  }
};
