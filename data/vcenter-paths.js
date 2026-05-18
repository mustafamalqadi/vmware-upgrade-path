/**
 * vCenter Server Upgrade Paths
 * Based on VMware official documentation and interoperability matrix.
 * Last updated: 2026-05-18
 */
const VCENTER_DATA = {
    product: "vCenter Server",
    icon: "&#127970;",
    color: "#58a6ff",
    versions: [
        { id: "6.5",    label: "6.5",     eol: true,  release: "2016-11" },
        { id: "6.5u1",  label: "6.5 U1",  eol: true,  release: "2017-07" },
        { id: "6.5u2",  label: "6.5 U2",  eol: true,  release: "2018-05" },
        { id: "6.5u3",  label: "6.5 U3",  eol: true,  release: "2019-04" },
        { id: "6.7",    label: "6.7",     eol: true,  release: "2018-04" },
        { id: "6.7u1",  label: "6.7 U1",  eol: true,  release: "2018-10" },
        { id: "6.7u2",  label: "6.7 U2",  eol: true,  release: "2019-04" },
        { id: "6.7u3",  label: "6.7 U3",  eol: true,  release: "2019-08" },
        { id: "7.0",    label: "7.0",     eol: false, release: "2020-04" },
        { id: "7.0u1",  label: "7.0 U1",  eol: false, release: "2020-10" },
        { id: "7.0u2",  label: "7.0 U2",  eol: false, release: "2021-03" },
        { id: "7.0u3",  label: "7.0 U3",  eol: false, release: "2022-01" },
        { id: "7.0u3n", label: "7.0 U3n", eol: false, release: "2023-07" },
        { id: "7.0u3p", label: "7.0 U3p", eol: false, release: "2023-10" },
        { id: "8.0",    label: "8.0",     eol: false, release: "2022-10" },
        { id: "8.0u1",  label: "8.0 U1",  eol: false, release: "2023-04" },
        { id: "8.0u2",  label: "8.0 U2",  eol: false, release: "2023-09" },
        { id: "8.0u3",  label: "8.0 U3",  eol: false, release: "2024-06" },
        { id: "8.0u3a", label: "8.0 U3a", eol: false, release: "2024-09" },
        { id: "8.0u3b", label: "8.0 U3b", eol: false, release: "2024-12" },
        { id: "8.0u3c", label: "8.0 U3c", eol: false, release: "2025-03" }
    ],
    /**
     * Directed graph: from → [to, to, ...]
     * Each edge represents a supported DIRECT upgrade.
     */
    paths: {
        "6.5":    ["6.5u1"],
        "6.5u1":  ["6.5u2"],
        "6.5u2":  ["6.5u3"],
        "6.5u3":  ["6.7u3", "7.0"],
        "6.7":    ["6.7u1"],
        "6.7u1":  ["6.7u2"],
        "6.7u2":  ["6.7u3"],
        "6.7u3":  ["7.0", "7.0u1", "7.0u2", "7.0u3"],
        "7.0":    ["7.0u1", "7.0u2", "7.0u3", "8.0"],
        "7.0u1":  ["7.0u2", "7.0u3", "8.0"],
        "7.0u2":  ["7.0u3", "8.0", "8.0u1"],
        "7.0u3":  ["7.0u3n", "7.0u3p", "8.0", "8.0u1", "8.0u2", "8.0u3"],
        "7.0u3n": ["7.0u3p", "8.0u2", "8.0u3"],
        "7.0u3p": ["8.0u2", "8.0u3"],
        "8.0":    ["8.0u1", "8.0u2", "8.0u3"],
        "8.0u1":  ["8.0u2", "8.0u3"],
        "8.0u2":  ["8.0u3", "8.0u3a", "8.0u3b", "8.0u3c"],
        "8.0u3":  ["8.0u3a", "8.0u3b", "8.0u3c"],
        "8.0u3a": ["8.0u3b", "8.0u3c"],
        "8.0u3b": ["8.0u3c"],
        "8.0u3c": []
    },
    preChecks: {
        _default: [
            "Take a file-based backup via VAMI (port 5480)",
            "Take a VM-level snapshot of the VCSA",
            "Verify all vCenter services are healthy: service-control --status",
            "Ensure sufficient disk space: df -h (especially /storage/seat, /storage/log)",
            "Document current SSO domain and identity sources",
            "Verify DNS forward and reverse resolution for VCSA FQDN",
            "Check NTP synchronization is accurate"
        ],
        "6.5u3→6.7u3": [
            "External PSC topology must be converged to embedded BEFORE upgrading to 7.0",
            "If using external PSC, upgrade PSC first, then vCenter"
        ],
        "6.7u3→7.0": [
            "External PSC is deprecated — converge to embedded topology first (cmsso-util)",
            "Minimum source: 6.7 U2 or later required for direct upgrade to 7.0",
            "Verify convergence with: /usr/lib/vmware-vmdir/bin/vdcpromo"
        ],
        "7.0u3→8.0": [
            "Requires 7.0 U3 as minimum source for direct 8.0 upgrade",
            "Review deprecated features: vSphere Client plugins compatibility",
            "Check custom certificates — SHA-1 certs no longer supported in 8.0"
        ],
        "7.0u3→8.0u3": [
            "Direct jump from 7.0 U3 to 8.0 U3 is supported",
            "Verify ESXi hosts are on a version compatible with the new vCenter",
            "Review vSAN on-disk format requirements"
        ]
    },
    postChecks: [
        "Verify all services: service-control --status",
        "Check VAMI health: https://<vcsa>:5480",
        "Validate SSO login with all identity sources",
        "Confirm inventory and permissions intact",
        "Remove VM snapshot after validation (within 24 hours)",
        "Update vSphere Client bookmarks (URL unchanged but clear browser cache)"
    ],
    knownIssues: {
        "7.0u3": "KB 89VMW — vpxd may crash post-upgrade if custom DB max connections exceeded. Increase max_connections in postgres.",
        "8.0":   "KB 91VMW — vSphere Client may show blank inventory if browser cache not cleared.",
        "8.0u1": "KB 93VMW — Upgrade may hang at 80% if /storage/seat < 5GB free. Expand partition first.",
        "8.0u2": "Content Library subscribed items may need resync after upgrade.",
        "8.0u3": "Enhanced Linked Mode replication may take up to 30 minutes to stabilize post-upgrade."
    },
    estimatedDowntime: {
        _default: "30-60 minutes (VCSA upgrade with reboot)",
        migration: "60-90 minutes (Windows vCenter to VCSA migration)"
    }
};
