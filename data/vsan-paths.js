/**
 * vSAN Upgrade Paths (On-Disk Format versions)
 * Based on VMware official documentation.
 * Last updated: 2026-05-18
 */
const VSAN_DATA = {
    product: "vSAN",
    icon: "&#128190;",
    color: "#d29922",
    versions: [
        { id: "6.5",    label: "6.5 (ODF 5)",   eol: true,  release: "2016-11", odf: 5 },
        { id: "6.6",    label: "6.6 (ODF 6)",   eol: true,  release: "2017-04", odf: 6 },
        { id: "6.6.1",  label: "6.6.1 (ODF 7)", eol: true,  release: "2017-07", odf: 7 },
        { id: "6.7",    label: "6.7 (ODF 7)",   eol: true,  release: "2018-04", odf: 7 },
        { id: "6.7u1",  label: "6.7 U1 (ODF 8)", eol: true, release: "2018-10", odf: 8 },
        { id: "6.7u3",  label: "6.7 U3 (ODF 10)", eol: true, release: "2019-08", odf: 10 },
        { id: "7.0",    label: "7.0 (ODF 12)",  eol: false, release: "2020-04", odf: 12 },
        { id: "7.0u1",  label: "7.0 U1 (ODF 13)", eol: false, release: "2020-10", odf: 13 },
        { id: "7.0u2",  label: "7.0 U2 (ODF 15)", eol: false, release: "2021-03", odf: 15 },
        { id: "7.0u3",  label: "7.0 U3 (ODF 17)", eol: false, release: "2022-01", odf: 17 },
        { id: "8.0",    label: "8.0 (ODF 19)",  eol: false, release: "2022-10", odf: 19 },
        { id: "8.0u1",  label: "8.0 U1 (ODF 20)", eol: false, release: "2023-04", odf: 20 },
        { id: "8.0u2",  label: "8.0 U2 (ODF 21)", eol: false, release: "2023-09", odf: 21 },
        { id: "8.0u3",  label: "8.0 U3 (ODF 21)", eol: false, release: "2024-06", odf: 21 }
    ],
    paths: {
        "6.5":    ["6.6"],
        "6.6":    ["6.6.1"],
        "6.6.1":  ["6.7"],
        "6.7":    ["6.7u1"],
        "6.7u1":  ["6.7u3"],
        "6.7u3":  ["7.0"],
        "7.0":    ["7.0u1", "7.0u2", "7.0u3"],
        "7.0u1":  ["7.0u2", "7.0u3"],
        "7.0u2":  ["7.0u3", "8.0"],
        "7.0u3":  ["8.0", "8.0u1", "8.0u2", "8.0u3"],
        "8.0":    ["8.0u1", "8.0u2", "8.0u3"],
        "8.0u1":  ["8.0u2", "8.0u3"],
        "8.0u2":  ["8.0u3"],
        "8.0u3":  []
    },
    preChecks: {
        _default: [
            "Upgrade vCenter FIRST, then ESXi hosts, THEN upgrade vSAN on-disk format",
            "vSAN ODF upgrade is ONE-WAY — cannot downgrade once applied",
            "ALL hosts in the cluster must be on the same ESXi version before ODF upgrade",
            "Ensure vSAN health is green: no degraded objects, no resyncing components",
            "Check cluster has sufficient capacity for rebuild (at least 1 host worth of slack)",
            "Verify no active vSAN alarms: esxcli vsan health cluster list",
            "Confirm all disk groups are healthy: esxcli vsan storage list"
        ],
        "6.7u3→7.0": [
            "ODF 10 → 12 enables new deduplication and compression improvements",
            "vSAN ESA (Express Storage Architecture) introduced in 8.0 — not applicable yet",
            "Review stretched cluster configuration if applicable"
        ],
        "7.0u3→8.0": [
            "ODF 17 → 19 enables vSAN ESA support (single-tier, NVMe-native)",
            "ESA requires ALL NVMe storage — cannot mix SAS/SATA in ESA mode",
            "OSA (Original Storage Architecture) still fully supported",
            "Consider if ESA migration is desired — requires fresh disk group creation"
        ]
    },
    postChecks: [
        "Verify ODF version: esxcli vsan cluster get (check Sub-Cluster On-Disk Format Version)",
        "Run vSAN health check from vCenter: all green",
        "Confirm no resyncing objects: esxcli vsan debug resync summary",
        "Validate dedup/compression ratios if enabled",
        "Check capacity usage didn't spike unexpectedly"
    ],
    notes: {
        "odf_warning": "On-Disk Format upgrade is IRREVERSIBLE. Once upgraded, you cannot rollback without destroying disk groups.",
        "esa_note": "vSAN 8.0 ESA is a separate architecture — migration from OSA requires new disk group creation (data migration via Storage vMotion).",
        "rolling": "ESXi rolling upgrade maintains vSAN availability. Upgrade one host at a time, wait for resync to complete."
    },
    estimatedDowntime: {
        _default: "Zero VM downtime (rolling ESXi upgrade + ODF upgrade is non-disruptive)",
        odf_upgrade: "5-10 minutes (metadata operation, no data movement)",
        esa_migration: "Hours (depends on data volume — full Storage vMotion required)"
    }
};
