/**
 * ESXi Upgrade Paths
 * Based on VMware official documentation and interoperability matrix.
 * Last updated: 2026-05-18
 */
const ESXI_DATA = {
    product: "ESXi",
    icon: "&#128421;",
    color: "#3fb950",
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
    paths: {
        "6.5":    ["6.5u1"],
        "6.5u1":  ["6.5u2"],
        "6.5u2":  ["6.5u3"],
        "6.5u3":  ["6.7u3", "7.0"],
        "6.7":    ["6.7u1"],
        "6.7u1":  ["6.7u2"],
        "6.7u2":  ["6.7u3"],
        "6.7u3":  ["7.0", "7.0u1", "7.0u2", "7.0u3"],
        "7.0":    ["7.0u1", "7.0u2", "7.0u3"],
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
            "Verify vCenter is already upgraded to a version ≥ target ESXi version",
            "Place host in maintenance mode (evacuate all VMs via DRS or manually)",
            "Check boot device has sufficient space (≥ 32GB recommended for 8.x)",
            "Verify hardware compatibility (CPU, NIC, HBA) against VMware HCL",
            "Document current VIB list: esxcli software vib list > /tmp/vibs-before.txt",
            "Check for 3rd-party VIBs that may block upgrade (community-supported level)",
            "Disable Secure Boot temporarily if custom VIBs are installed",
            "Backup host configuration: vim-cmd hostsvc/firmware/backup_config"
        ],
        "6.7u3→7.0": [
            "Legacy CentOS-based ESXi replaced with Photon — boot partition layout changes",
            "USB/SD card boot deprecated in 7.0 U3+ (still works but unsupported for new installs)",
            "Check VMFS-5 datastores — still supported but consider upgrade to VMFS-6"
        ],
        "7.0u3→8.0": [
            "Boot device minimum 32GB (was 8GB in 6.x)",
            "USB/SD card boot no longer supported as of 8.0 — migrate to M.2/BOSS/SAN boot",
            "vSphere Lifecycle Manager (vLCM) image-based management recommended over baselines",
            "Check for deprecated drivers: some legacy NICs/HBAs removed in 8.0"
        ],
        "8.0u2→8.0u3": [
            "Verify firmware compatibility with 8.0 U3 — Dell/HPE/Lenovo release async bundles",
            "If using vLCM with Hardware Support Manager (HSM), update firmware depot first"
        ]
    },
    postChecks: [
        "Exit maintenance mode",
        "Verify host reconnects to vCenter successfully",
        "Check vmkernel.log for errors: tail -100 /var/log/vmkernel.log",
        "Validate all VMkernel adapters and vMotion connectivity: vmkping",
        "Run DRS to rebalance VMs back to upgraded host",
        "Verify vSAN disk group health (if vSAN cluster)",
        "Confirm esxcli software vib list shows expected version",
        "Test vMotion to/from upgraded host"
    ],
    upgradeMethods: [
        { method: "vLCM Image", desc: "Recommended — cluster-level image with firmware. Remediate via vCenter.", best: true },
        { method: "vLCM Baseline", desc: "Legacy — attach baseline, scan, remediate. Being deprecated.", best: false },
        { method: "esxcli", desc: "CLI: esxcli software profile update -d /path/to/depot.zip -p ESXi-8.0U3-standard", best: false },
        { method: "ISO Interactive", desc: "Boot from ISO, select Upgrade. Best for single-host or lab.", best: false }
    ],
    estimatedDowntime: {
        _default: "15-30 minutes per host (with rolling upgrade via DRS, zero VM downtime)",
        single_host: "30-45 minutes (host reboot + POST + reconnect)"
    }
};
