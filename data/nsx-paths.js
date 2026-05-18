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
      "CRITICAL: NSX upgrade order MUST be: NSX Manager Cluster → Edge Nodes → Host Transport Nodes — never reverse this",
      "Run NSX pre-upgrade checks from System > Upgrade in NSX Manager UI — resolve all blocking issues before proceeding",
      "Verify NSX Manager cluster health: GET /api/v1/cluster/status — all 3 nodes must show STABLE, not DEGRADED",
      "Ensure all Edge Nodes report UP status: Fabric > Edges — check both admin and transport node state",
      "Validate host transport node connectivity: Fabric > Host Transport Nodes — all must show 'Success' state",
      "Backup NSX Manager configuration: System > Backup & Restore > Backup Now — store on remote SFTP/NFS",
      "Verify sufficient disk space on all NSX Manager nodes: df -h (minimum 50GB free on each node)",
      "Check for any active alarms in NSX Manager: System > Alarms — resolve all critical alarms before upgrade",
      "Verify NSX Controller connectivity (NSX-T 3.x): System > Fabric > Nodes — all controllers must be Connected",
      "Document current DFW rule count and sections: Security > Distributed Firewall — export config as backup",
      "Verify BGP/OSPF peering is stable on all Edge Nodes: get bgp neighbor summary (from Edge CLI)",
      "If using NSX Federation, verify Global Manager health and Local Manager connectivity across all sites",
      "Check NSX license validity and entitlements — upgrade may require updated license for new features"
    ],
    "3.2.x->4.0": [
      "NSX 4.0 introduces Policy-only mode — verify ALL configurations exist in Policy API (not just Manager API)",
      "MP-to-Policy promotion MUST be completed before upgrading to 4.x: System > Configuration > MP to Policy",
      "Review ALL automation scripts for deprecated Manager API calls — /api/v1/logical-* endpoints are deprecated",
      "NSX Intelligence integration changes in 4.0 — verify compatibility and plan separate upgrade if needed",
      "Federation configurations require coordinated upgrade across ALL locations — upgrade Global Manager first",
      "Export all DFW rules and NAT configurations as backup: use NSX API or Terraform state export",
      "Verify no active Service Insertion (SI) partners that require compatible versions"
    ],
    "4.0.x->4.1": [
      "Verify vCenter is at 8.0 or later — NSX 4.1 requires vCenter 8.0+ (will fail pre-check otherwise)",
      "Check distributed firewall rule count — optimization recommended before upgrade if > 10,000 rules",
      "Validate Gateway Firewall policies are backed up separately: Security > Gateway Firewall > Export",
      "Review NSX ALB (Avi) integration compatibility if using load balancing — separate upgrade may be needed",
      "Verify Edge Node VM hardware version is compatible with target ESXi version",
      "Check for any pending Edge Node or Host Transport Node configuration changes that need to be realized first"
    ]
  },
  postChecks: [
    "Verify NSX Manager cluster health: all 3 nodes must show STABLE — System > Appliances",
    "Check Edge Node upgrade status: all Edge Nodes must report the new version — Fabric > Edge Transport Nodes",
    "Validate host transport node connectivity: Fabric > Host Transport Nodes — all must show 'Success'",
    "Test Distributed Firewall (DFW) rules: verify inter-VM traffic flows match expected allow/deny policies",
    "Verify East-West traffic: ping between VMs on different hosts within the same NSX segment — should succeed",
    "Test North-South traffic: verify external connectivity through Tier-0 gateway — ping external destination from VM",
    "Check Load Balancer VIP accessibility if NSX LB is configured: curl -k https://<vip>:<port>",
    "Verify BGP/OSPF peering status on Edge Nodes: get bgp neighbor summary — all peers should be Established",
    "Validate NAT rules are functioning: test SNAT/DNAT flows for critical applications",
    "Check NSX Manager UI responsiveness and API response times: GET /api/v1/cluster/status should return < 2 seconds",
    "Verify micro-segmentation policies are enforced: check DFW rule hit counts in Security > Distributed Firewall",
    "If using NSX-T VPN (IPSec/L2VPN), verify tunnel status: Networking > VPN > IPSec Sessions — should show UP"
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
