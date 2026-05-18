/**
 * NSX-T / NSX Upgrade Paths
 * Based on VMware official documentation.
 * Last updated: 2026-05-18
 */
const NSX_DATA = {
    product: "NSX",
    icon: "&#127760;",
    color: "#a78bfa",
    versions: [
        { id: "3.1.0",  label: "3.1.0",  eol: true,  release: "2020-10" },
        { id: "3.1.1",  label: "3.1.1",  eol: true,  release: "2021-01" },
        { id: "3.1.2",  label: "3.1.2",  eol: true,  release: "2021-03" },
        { id: "3.1.3",  label: "3.1.3",  eol: true,  release: "2021-07" },
        { id: "3.2.0",  label: "3.2.0",  eol: true,  release: "2021-12" },
        { id: "3.2.1",  label: "3.2.1",  eol: true,  release: "2022-05" },
        { id: "3.2.2",  label: "3.2.2",  eol: true,  release: "2022-10" },
        { id: "3.2.3",  label: "3.2.3",  eol: false, release: "2023-04" },
        { id: "4.0.0",  label: "4.0.0",  eol: false, release: "2022-12" },
        { id: "4.0.1",  label: "4.0.1",  eol: false, release: "2023-03" },
        { id: "4.1.0",  label: "4.1.0",  eol: false, release: "2023-06" },
        { id: "4.1.1",  label: "4.1.1",  eol: false, release: "2023-10" },
        { id: "4.1.2",  label: "4.1.2",  eol: false, release: "2024-02" },
        { id: "4.2.0",  label: "4.2.0",  eol: false, release: "2024-06" },
        { id: "4.2.1",  label: "4.2.1",  eol: false, release: "2024-10" }
    ],
    paths: {
        "3.1.0":  ["3.1.1"],
        "3.1.1":  ["3.1.2"],
        "3.1.2":  ["3.1.3"],
        "3.1.3":  ["3.2.0", "3.2.1", "3.2.2", "3.2.3"],
        "3.2.0":  ["3.2.1", "3.2.2", "3.2.3", "4.0.0"],
        "3.2.1":  ["3.2.2", "3.2.3", "4.0.0", "4.0.1"],
        "3.2.2":  ["3.2.3", "4.0.1", "4.1.0"],
        "3.2.3":  ["4.0.1", "4.1.0", "4.1.1"],
        "4.0.0":  ["4.0.1", "4.1.0"],
        "4.0.1":  ["4.1.0", "4.1.1"],
        "4.1.0":  ["4.1.1", "4.1.2", "4.2.0"],
        "4.1.1":  ["4.1.2", "4.2.0"],
        "4.1.2":  ["4.2.0", "4.2.1"],
        "4.2.0":  ["4.2.1"],
        "4.2.1":  []
    },
    preChecks: {
        _default: [
            "CRITICAL: NSX must be upgraded BEFORE ESXi if NSX version requires specific ESXi build",
            "Upgrade order: NSX Manager cluster → Edge Nodes → Host Transport Nodes",
            "Verify NSX Manager cluster is stable (3 nodes, all healthy)",
            "Check Edge Node capacity — upgrade causes brief failover (seconds)",
            "Back up NSX Manager: GET /api/v1/cluster/backups (or SFTP schedule)",
            "Verify no active alarms in NSX Manager UI",
            "Check compute manager (vCenter) connectivity is healthy",
            "Review upgrade coordinator pre-checks: Plan → Run Pre-Checks"
        ],
        "3.2.3→4.0.1": [
            "NSX-T rebranded to 'NSX' starting 4.0 — no functional change",
            "Policy API is now the primary API — Management API (MP) deprecated in 4.x",
            "Distributed Firewall rules must be converted from MP to Policy if not done already",
            "Federation upgrade: upgrade Local Managers first, then Global Manager"
        ],
        "4.1.x→4.2.0": [
            "New distributed services engine capabilities",
            "Review Edge Node sizing — 4.2 may benefit from Large Edge form factor",
            "Gateway Firewall enhancements may require policy review"
        ]
    },
    postChecks: [
        "Verify NSX Manager cluster health: GET /api/v1/cluster/status",
        "Check all Edge Nodes are UP: GET /api/v1/transport-nodes/state",
        "Verify host transport node connectivity (TEPs up, tunnels established)",
        "Validate distributed firewall rule processing: GET /policy/api/v1/infra/realized-state/status",
        "Test East-West traffic between VMs on different hosts",
        "Test North-South traffic through Edge/Gateway",
        "Verify load balancer VIPs if applicable",
        "Check BGP/OSPF peer state on Edge Nodes"
    ],
    upgradeOrder: [
        { step: 1, component: "NSX Manager Cluster", desc: "Upgrade coordinater runs on manager. Rolling upgrade of 3 manager nodes.", downtime: "None (rolling)" },
        { step: 2, component: "Edge Nodes", desc: "One Edge at a time. Active-standby failover during upgrade.", downtime: "Seconds (failover)" },
        { step: 3, component: "Host Transport Nodes", desc: "Upgrade NSX VIBs on ESXi hosts. Maintenance mode per host.", downtime: "None (rolling via vLCM)" }
    ],
    estimatedDowntime: {
        _default: "Near-zero (rolling upgrade with brief Edge failover)",
        edge_failover: "2-5 seconds per Edge node failover",
        full_cluster: "60-90 minutes for full environment (manager + edges + hosts)"
    }
};
