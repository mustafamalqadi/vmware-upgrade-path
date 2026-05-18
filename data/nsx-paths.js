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
      "CRITICAL: NSX upgrade order must be: NSX Manager -> Edge Nodes -> Host Transport Nodes",
      "Run NSX pre-upgrade checks from System > Upgrade in NSX Manager UI",
      "Verify NSX Manager cluster health: GET /api/v1/cluster/status",
      "Ensure all Edge Nodes report UP status: GET /api/v1/transport-nodes/state",
      "Validate host transport node connectivity: GET /api/v1/transport-zones/status",
      "Backup NSX Manager configuration: System > Backup & Restore > Backup Now",
      "Verify sufficient disk space on NSX Manager nodes (minimum 50GB free)",
      "Check for any active alarms in NSX Manager that could block upgrade"
    ],
    "3.2.x->4.0": [
      "NSX 4.0 introduces policy-only mode - verify all configurations are in Policy API",
      "MP-to-Policy promotion must be completed before upgrading to 4.x",
      "Review deprecated Manager API calls used by automation scripts",
      "NSX Intelligence integration changes - verify compatibility",
      "Federation configurations require coordinated upgrade across all locations"
    ],
    "4.0.x->4.1": [
      "Verify vCenter is at 8.0 or later (NSX 4.1 requires vCenter 8.0+)",
      "Check distributed firewall rule counts - optimization recommended before upgrade",
      "Validate Gateway Firewall policies are backed up separately",
      "Review NSX ALB (Avi) integration compatibility if using load balancing"
    ]
  },
  postChecks: [
    "Verify NSX Manager cluster health: all 3 nodes must show STABLE",
    "Check Edge Node upgrade status: all Edge Nodes must report new version",
    "Validate host transport node connectivity from Fabric > Host Transport Nodes",
    "Test Distributed Firewall (DFW) rules by verifying inter-VM traffic flows",
    "Verify East-West traffic between VMs on different hosts within same segment",
    "Test North-South traffic by validating external connectivity through T0 gateway",
    "Check Load Balancer VIP accessibility if NSX LB is configured",
    "Verify BGP/OSPF peering status on Edge Nodes: get bgp neighbor summary"
  ],
  upgradeOrder: [
    { step: 1, component: "NSX Manager Cluster", desc: "Upgrade all 3 NSX Manager nodes (rolling, one at a time)", downtime: "No control-plane downtime if 3-node cluster" },
    { step: 2, component: "Edge Nodes", desc: "Upgrade Edge Nodes in each Edge Cluster (one at a time with failover)", downtime: "2-5 seconds per Edge failover event" },
    { step: 3, component: "Host Transport Nodes", desc: "Upgrade NSX VIBs on all ESXi hosts (can be done per cluster)", downtime: "No data-plane downtime if using rolling upgrade" }
  ],
  estimatedDowntime: {
    _default: "Near-zero (rolling upgrade with failover)",
    edge_failover: "2-5 seconds per Edge Node failover",
    full_cluster: "60-90 min for complete environment upgrade"
  }
};
