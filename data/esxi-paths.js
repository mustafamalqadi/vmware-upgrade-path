const ESXI_DATA = {
  product: "ESXi",
  icon: "&#128421;",
  color: "#3fb950",
  versions: [
    { id: "6.5", label: "6.5", eol: true, release: "2016-11", build: "4564106" },
    { id: "6.5u1", label: "6.5 U1", eol: true, release: "2017-07", build: "5969303" },
    { id: "6.5u2", label: "6.5 U2", eol: true, release: "2018-05", build: "8294253" },
    { id: "6.5u3", label: "6.5 U3", eol: true, release: "2019-04", build: "13932383" },
    { id: "6.7", label: "6.7", eol: true, release: "2018-04", build: "8169922" },
    { id: "6.7u1", label: "6.7 U1", eol: true, release: "2018-10", build: "10302608" },
    { id: "6.7u2", label: "6.7 U2", eol: true, release: "2019-04", build: "13006603" },
    { id: "6.7u3", label: "6.7 U3", eol: true, release: "2019-08", build: "14320388" },
    { id: "7.0", label: "7.0", eol: false, release: "2020-04", build: "15843807" },
    { id: "7.0u1", label: "7.0 U1", eol: false, release: "2020-10", build: "16850804" },
    { id: "7.0u2", label: "7.0 U2", eol: false, release: "2021-03", build: "17630552" },
    { id: "7.0u3", label: "7.0 U3", eol: false, release: "2021-10", build: "19193900" },
    { id: "7.0u3n", label: "7.0 U3n", eol: false, release: "2023-03", build: "21930508" },
    { id: "7.0u3p", label: "7.0 U3p", eol: false, release: "2023-07", build: "22348816" },
    { id: "8.0", label: "8.0", eol: false, release: "2022-10", build: "20513097" },
    { id: "8.0u1", label: "8.0 U1", eol: false, release: "2023-04", build: "21495797" },
    { id: "8.0u2", label: "8.0 U2", eol: false, release: "2023-09", build: "22380479" },
    { id: "8.0u3", label: "8.0 U3", eol: false, release: "2024-06", build: "24022510" },
    { id: "8.0u3a", label: "8.0 U3a", eol: false, release: "2024-08", build: "24280767" },
    { id: "8.0u3b", label: "8.0 U3b", eol: false, release: "2024-11", build: "24585291" },
    { id: "8.0u3c", label: "8.0 U3c", eol: false, release: "2025-02", build: "25012014" }
  ],
  paths: {
    "6.5": ["6.5u1"],
    "6.5u1": ["6.5u2"],
    "6.5u2": ["6.5u3"],
    "6.5u3": ["6.7u3", "7.0"],
    "6.7": ["6.7u1"],
    "6.7u1": ["6.7u2"],
    "6.7u2": ["6.7u3"],
    "6.7u3": ["7.0", "7.0u1", "7.0u2", "7.0u3"],
    "7.0": ["7.0u1", "7.0u2", "7.0u3", "8.0"],
    "7.0u1": ["7.0u2", "7.0u3", "8.0"],
    "7.0u2": ["7.0u3", "8.0", "8.0u1"],
    "7.0u3": ["7.0u3n", "7.0u3p", "8.0", "8.0u1", "8.0u2", "8.0u3"],
    "7.0u3n": ["7.0u3p", "8.0u2", "8.0u3"],
    "7.0u3p": ["8.0u2", "8.0u3"],
    "8.0": ["8.0u1", "8.0u2", "8.0u3"],
    "8.0u1": ["8.0u2", "8.0u3"],
    "8.0u2": ["8.0u3", "8.0u3a", "8.0u3b", "8.0u3c"],
    "8.0u3": ["8.0u3a", "8.0u3b", "8.0u3c"],
    "8.0u3a": ["8.0u3b", "8.0u3c"],
    "8.0u3b": ["8.0u3c"],
    "8.0u3c": []
  },
  preChecks: {
    _default: [
      "Place host in maintenance mode: esxcli system maintenanceMode set --enable true (DRS will evacuate VMs if enabled)",
      "Verify boot device health and SMART status: esxcli storage core device list | grep -i boot",
      "Check VMware Hardware Compatibility List (HCL) for target ESXi version — verify server model, NICs, storage controllers",
      "List all installed VIBs and verify compatibility with target version: esxcli software vib list --rebooting-image",
      "Verify boot device free space: esxcli storage filesystem list — need at least 4GB free on boot volume",
      "Ensure no active vMotion or Storage vMotion tasks: esxcli vm process list to check running operations",
      "Confirm NTP is synchronized: esxcli system time get && esxcli hardware clock get — drift must be < 5 seconds",
      "Check host profile compliance if using Host Profiles: Verify via vCenter > Host > Monitor > Compliance",
      "Verify ESXi shell/SSH access is enabled for troubleshooting: esxcli system settings advanced list -o /UserVars/ESXiShellInteractiveTimeOut",
      "Document current network config: esxcli network vswitch standard list && esxcli network vswitch dvs vmware list",
      "Back up host configuration: vim-cmd hostsvc/firmware/sync_config && vim-cmd hostsvc/firmware/backup_config",
      "Verify no coredump on host that could indicate instability: ls /var/core/"
    ],
    "6.7u3->7.0": [
      "WARNING: USB/SD boot devices are DEPRECATED in ESXi 7.0 — plan migration to SSD/NVMe/M.2 before or after upgrade",
      "Verify no VMFS-5 datastores in use — upgrade to VMFS-6: esxcli storage vmfs upgrade -l <datastore_label>",
      "Check for legacy CIM providers that are incompatible with ESXi 7.0: esxcli software vib list | grep -i cim",
      "Validate network driver compatibility — e1000e and some Broadcom drivers replaced by native drivers in 7.0",
      "Remove any third-party async drivers not signed for ESXi 7.0: esxcli software vib remove -n <vib_name>",
      "Verify server BIOS/UEFI firmware is on the vendor-recommended level for ESXi 7.0",
      "Check for deprecated ESXi commands: esxcfg-* commands are replaced by esxcli equivalents in 7.0",
      "If using iSCSI, verify iSCSI adapter config will persist: esxcli iscsi adapter list"
    ],
    "7.0u3->8.0": [
      "CRITICAL: Boot device must be at least 32GB — ESXi 8.0 requires 8GB minimum for ESXi-OSData partition",
      "USB/SD boot devices are NO LONGER SUPPORTED in ESXi 8.0 — must migrate to persistent SSD/NVMe/BOSS before upgrade",
      "Check for deprecated/removed drivers: esxcli software vib list | grep -E 'nmlx4|bnx2x|lpfc|elxnet|brcmfcoe'",
      "Verify TPM 2.0 module presence if enabling vSphere Trust Authority: esxcli hardware tpm get",
      "Validate NIC driver compatibility — several inbox drivers removed in 8.0 (check VMware IO Compatibility Guide)",
      "Ensure Secure Boot is configured in BIOS if planning to use vSphere 8 Attestation features",
      "Check for custom firewall rules that may need reconfiguration: esxcli network firewall ruleset list",
      "Verify server firmware meets ESXi 8.0 requirements — check vendor support matrix (Dell, HPE, Lenovo, Cisco UCS)",
      "If using Quick Boot, verify compatibility with target ESXi 8.0 build: esxcli system settings kernel list -o quickBoot"
    ],
    "8.0u2->8.0u3": [
      "Verify server firmware is on vendor-supported matrix for ESXi 8.0 U3 — check vendor release notes",
      "Check for known NIC firmware issues with i40en/ice drivers: esxcli network nic get -n <nic> to show driver version",
      "Validate vSAN disk group compatibility if host participates in vSAN cluster: esxcli vsan storage list",
      "Review ESXi 8.0 U3 release notes for any resolved security vulnerabilities that require immediate patching"
    ]
  },
  postChecks: [
    "Exit maintenance mode: esxcli system maintenanceMode set --enable false",
    "Verify host reconnects to vCenter and shows 'Connected' status (not 'Disconnected' or 'Not Responding')",
    "Check vmkernel.log for errors: tail -200 /var/log/vmkernel.log | grep -iE 'error|warn|fail|panic'",
    "Test vmkernel network connectivity on all vmk interfaces: vmkping -I vmk0 <gateway_ip> -s 8972 (jumbo frame test)",
    "Verify management network accessibility: vmkping -I vmk0 <vcenter_ip>",
    "Monitor DRS rebalancing — VMs should migrate back to host within 5 minutes of exiting maintenance mode",
    "Run vSAN health check if host is part of vSAN cluster: esxcli vsan health cluster list",
    "Verify installed VIBs match expected profile: esxcli software profile get",
    "Test vMotion with a small test VM to validate compute and network compatibility",
    "Verify storage paths are active: esxcli storage nmp path list — all paths should show 'Active (I/O)'",
    "Check VMFS datastore accessibility: esxcli storage filesystem list — all should show mounted",
    "Verify ESXi build number matches target: esxcli system version get",
    "If using distributed switch, verify uplink connectivity: esxcli network vswitch dvs vmware list"
  ],
  upgradeMethods: [
    { method: "vLCM Image", desc: "vSphere Lifecycle Manager with a defined cluster image — applies firmware + drivers + ESXi in one operation. Requires vCenter 7.0+. Best for standardized clusters.", best: true },
    { method: "vLCM Baseline", desc: "Legacy Update Manager baseline with ESXi ISO/patch bundle. Attach baseline to cluster or host, scan, then remediate. Works with vCenter 6.5+.", best: false },
    { method: "esxcli", desc: "CLI upgrade: esxcli software profile update -d /vmfs/volumes/<ds>/<depot.zip> -p <profile>. Best for scripted/automated upgrades or when vCenter is unavailable.", best: false },
    { method: "ISO Interactive", desc: "Boot from ESXi installer ISO (USB/CD/iLO/iDRAC), select 'Upgrade' to preserve VMFS and config. Best for standalone hosts or initial deployment.", best: false }
  ],
  knownIssues: {
    "7.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-12' target='_blank'>KB #12 — ESXi Patch / Upgrade with vLCM</a>: Remediation may fail if depot metadata is corrupted or host has incompatible async drivers.",
    "8.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-15' target='_blank'>KB #15 — SSH / Shell &amp; Hardening</a>: After ESXi 8.0 upgrade, SSH may be disabled by default due to stricter lockdown profile. Re-enable if needed.",
    "8.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase8.html#kb-75' target='_blank'>KB #75 — vLCM Image-Based Updates</a>: Hardware Support Manager (HSM) firmware add-ons may fail compliance after update to 8.0 U3."
  },
  estimatedDowntime: {
    _default: "15-30 min per host",
    single_host: "30-45 min"
  }
};
