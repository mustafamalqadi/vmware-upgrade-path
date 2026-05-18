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
      "<strong>Maintenance Mode:</strong> esxcli system maintenanceMode set --enable true. If DRS is enabled, VMs auto-evacuate. If standalone host: manually power off or vMotion VMs first. Verify: esxcli system maintenanceMode get should return 'true'. If stuck: check for VMs that can't migrate (FT, local storage, USB passthrough)",
      "<strong>Boot Device Health:</strong> esxcli storage core device list | grep -i boot. Check for 'Status: on' and no errors. For USB/SD: check wear level via smartctl if available. For SSD: check esxcli storage core device smart get -d <naa.xxx>. Replace degraded boot media BEFORE upgrade",
      "<strong>HCL Verification:</strong> Go to https://www.vmware.com/resources/compatibility. Search server model + target ESXi version. Verify: server model listed, storage controller driver available, NIC driver included in target ESXi build. Unsupported hardware = potential PSOD post-upgrade",
      "<strong>VIB Compatibility:</strong> esxcli software vib list --rebooting-image. Note all third-party VIBs (non-VMware). Check vendor sites for updated VIBs compatible with target ESXi. Remove incompatible VIBs: esxcli software vib remove -n <vib-name>. Common issues: old HP/Dell CIM providers, outdated NIC drivers",
      "<strong>Boot Device Space:</strong> esxcli storage filesystem list. Boot volume needs at least 4GB free for ESXi 7.x, or 8GB for ESXi 8.x (OSData partition). If boot device < 32GB total: ESXi 8.x will NOT install. Plan boot device replacement if needed",
      "<strong>Active Tasks:</strong> Check for running operations: esxcli vm process list (shows VMs with active CPU). In vCenter: Monitor > Tasks > filter by host. No active vMotion, Storage vMotion, cloning, or snapshotting should be in progress. Wait for completion or cancel",
      "<strong>NTP Verification:</strong> esxcli system time get (shows system time). esxcli hardware clock get (shows hardware clock). Compare with known accurate source. Max drift: 5 seconds. Fix: esxcli system ntp set --server=<ntp-ip> --enabled=true. Then: /etc/init.d/ntpd restart",
      "<strong>Host Profile Compliance:</strong> In vCenter: select host > Monitor > Compliance. Should show 'Compliant'. If non-compliant: remediate BEFORE upgrade or document deviations. Non-compliant host profiles may cause issues during post-upgrade re-application",
      "<strong>SSH Access:</strong> Verify SSH enabled: esxcli system settings advanced list -o /UserVars/ESXiShellInteractiveTimeOut. Enable temporarily: vim-cmd hostsvc/enable_ssh. You'll need SSH access if upgrade fails and console-only access is required for troubleshooting",
      "<strong>Network Documentation:</strong> Document before changing anything: esxcli network vswitch standard list (shows all standard switches and port groups). esxcli network vswitch dvs vmware list (DVS uplinks). esxcli network ip interface list (vmkernel interfaces and IPs). Save output to external file",
      "<strong>Configuration Backup:</strong> vim-cmd hostsvc/firmware/sync_config (syncs running config to boot bank). vim-cmd hostsvc/firmware/backup_config (returns URL to download .tgz backup). Download the backup externally. This can restore full host config if upgrade corrupts settings",
      "<strong>Stability Check:</strong> ls /var/core/ \u2014 any files here indicate recent crash/PSOD. Also: tail -50 /var/log/vmkernel.log | grep -i 'panic\\|error\\|fail'. A host that's already unstable should be stabilized BEFORE upgrading. Investigate core dumps with vm-support bundle"
    ],
    "6.7u3->7.0": [
      "<strong>USB/SD Boot Deprecation:</strong> USB/SD boot devices are DEPRECATED in ESXi 7.0 — they still work but with degraded performance and no swap. Plan migration to SSD/NVMe/M.2/BOSS card. Check current boot device: esxcli system boot device get. If USB/SD: schedule replacement or accept degraded IOPs on boot volume",
      "<strong>VMFS Version:</strong> esxcli storage vmfs list — check 'Version' column. VMFS-5 datastores should be upgraded to VMFS-6: esxcli storage vmfs upgrade -l <datastore_label>. Note: upgrade is non-disruptive and irreversible. VMFS-3 is completely unsupported in 7.0 and must be migrated",
      "<strong>CIM Provider Cleanup:</strong> esxcli software vib list | grep -i cim. Legacy CIM providers (hp-smx-provider, dell-configuration, etc.) are often incompatible with ESXi 7.0. Remove: esxcli software vib remove -n <vib>. Vendors provide updated iLO/iDRAC agents for 7.0 separately",
      "<strong>Network Driver Audit:</strong> esxcli network nic list — note driver names in 'Driver' column. Drivers like e1000e, bnx2x, tg3 are replaced by native ESXi drivers in 7.0. Check VMware IO Compatibility Guide for replacements. If driver removed: NIC will lose connectivity post-upgrade without correct replacement driver",
      "<strong>Async Driver Removal:</strong> esxcli software vib list | grep -v VMware — shows all non-VMware VIBs. Third-party async drivers not signed for ESXi 7.0 will cause boot failure. Remove: esxcli software vib remove -n <vib_name> --force. Reinstall 7.0-compatible version after upgrade",
      "<strong>Firmware Level:</strong> Check server BIOS/UEFI version via: esxcli hardware platform get (shows BIOS version). Cross-reference with vendor support matrix (Dell: DSU, HPE: SPP, Lenovo: BOMC). Outdated firmware can cause PSOD or hardware detection failures in ESXi 7.0",
      "<strong>Deprecated Commands:</strong> If automation scripts use esxcfg-* commands (esxcfg-vswitch, esxcfg-nics, esxcfg-vmknic): these are removed in 7.0. Update scripts to use esxcli equivalents BEFORE upgrade. Test in lab. esxcfg-vswitch → esxcli network vswitch standard*",
      "<strong>iSCSI Persistence:</strong> esxcli iscsi adapter list — note adapter name (vmhba65 typically). esxcli iscsi adapter target list — note static targets. After upgrade, verify iSCSI configuration persisted. If using dependent hardware iSCSI: verify NIC driver compatibility first"
    ],
    "7.0u3->8.0": [
      "<strong>Boot Device Size (CRITICAL):</strong> esxcli storage core device list | grep -i boot — check size. ESXi 8.0 requires minimum 32GB boot device (8GB for ESXi-OSData partition). If < 32GB: installer will REFUSE to upgrade. Solution: replace boot device with ≥ 32GB SSD/NVMe before upgrade attempt",
      "<strong>USB/SD Removal (MANDATORY):</strong> USB/SD boot devices are COMPLETELY UNSUPPORTED in ESXi 8.0. esxcli system boot device get — if shows USB or SD card: MUST migrate to persistent storage (BOSS card, M.2, SSD, NVMe) BEFORE upgrade. VMware will not install ESXi 8.0 to USB/SD",
      "<strong>Removed Drivers:</strong> esxcli software vib list | grep -E 'nmlx4|bnx2x|lpfc|elxnet|brcmfcoe'. These drivers are REMOVED from ESXi 8.0. If any present: associated hardware (Mellanox ConnectX-3, Broadcom 57xx, Emulex HBAs) will lose connectivity. Replace hardware or verify native driver alternatives exist",
      "<strong>TPM 2.0 Check:</strong> esxcli hardware tpm get. If planning vSphere Trust Authority or VM encryption: TPM 2.0 module required in server. If 'No TPM device found': features still work but without hardware attestation. For full security posture: install TPM 2.0 module before upgrade",
      "<strong>NIC Compatibility:</strong> esxcli network nic list — check Driver column. Multiple inbox NIC drivers removed in 8.0. Check VMware IO Compatibility Guide: https://www.vmware.com/resources/compatibility/search.php?deviceCategory=io. If driver removed: NIC goes dark post-upgrade = network outage",
      "<strong>Secure Boot Config:</strong> esxcli system settings encryption get — shows Secure Boot status. If planning vSphere 8 Attestation: enable Secure Boot in BIOS/UEFI BEFORE upgrade. Note: enabling Secure Boot post-install requires full reinstall. BIOS: Security > Secure Boot > Enabled",
      "<strong>Firewall Rules:</strong> esxcli network firewall ruleset list | grep -v true — shows disabled rulesets. Custom rules may need reconfiguration in 8.0 due to new default-deny posture. Document current rules: esxcli network firewall ruleset rule list > /tmp/fw-rules.txt. Review after upgrade",
      "<strong>Server Firmware Matrix:</strong> Check vendor support matrix: Dell (PowerEdge Support Matrix for ESXi 8.0), HPE (SPP for ESXi 8.0), Lenovo (UpdateXpress), Cisco (UCS HCL). Outdated firmware = potential PSOD, performance degradation, or feature incompatibility. Update firmware BEFORE ESXi upgrade",
      "<strong>Quick Boot Compatibility:</strong> esxcli system settings kernel list -o quickBoot. If enabled (value=TRUE): verify target ESXi 8.0 build supports Quick Boot for your hardware. Some platforms lose Quick Boot support in 8.0. If incompatible: disable to avoid boot hangs: esxcli system settings kernel set -s quickBoot -v FALSE"
    ],
    "8.0u2->8.0u3": [
      "<strong>Firmware Validation:</strong> esxcli hardware platform get — note BIOS version and server model. Check vendor release notes for ESXi 8.0 U3 compatibility. Dell: check DSU catalog, HPE: check SPP version, Lenovo: check BOMC/XCC firmware. Update firmware if below minimum supported version",
      "<strong>NIC Firmware Issues:</strong> esxcli network nic get -n <nic> — check 'Firmware Version' and 'Driver' fields. Known issues with i40en/ice drivers on Intel X710/XXV710 NICs at certain firmware levels. If firmware < recommended: NIC may drop packets or reset under load. Update NIC firmware via vendor tools",
      "<strong>vSAN Disk Groups:</strong> esxcli vsan storage list — verify all disk groups show 'inSync' status. If any disks show 'Degraded' or 'Absent': resolve BEFORE upgrade. Also check: esxcli vsan debug disk list — look for disk errors or rebuilt status. Never upgrade with unhealthy vSAN components",
      "<strong>Security Patches:</strong> Review ESXi 8.0 U3 release notes (https://docs.vmware.com/en/VMware-vSphere/8.0/rn/). Check 'Resolved Issues' and 'Security Fixes' sections. Note CVEs addressed. If current environment has compensating controls for those CVEs: plan to remove after successful upgrade"
    ]
  },
  postChecks: [
    "<strong>Exit Maintenance:</strong> esxcli system maintenanceMode set --enable false. In vCenter: right-click host > Exit Maintenance Mode. Host should show green 'Connected' within 60 seconds. If stays in maintenance: check for pending vSAN resync or failed DRS admission",
    "<strong>vCenter Connectivity:</strong> In vCenter, host should show 'Connected' status with green icon. If 'Disconnected': right-click > Connection > Reconnect. If 'Not Responding': verify management VMkernel (vmk0) IP is correct and reachable from VCSA: vmkping from VCSA side",
    "<strong>Kernel Log Review:</strong> tail -200 /var/log/vmkernel.log | grep -iE 'error|warn|fail|panic|PSOD'. Focus on entries after boot timestamp. Common post-upgrade warnings: driver version mismatches (usually harmless), storage path failover events. Critical: any 'panic' or 'PSOD' = immediate investigation",
    "<strong>Network Connectivity:</strong> Test each vmkernel interface: vmkping -I vmk0 <gateway> (management), vmkping -I vmk1 <vmotion-peer> (vMotion), vmkping -I vmk2 <vsan-peer> (vSAN). Add -s 8972 for jumbo frame validation. If ping fails: check VLAN tags, MTU settings, physical uplinks",
    "<strong>Management Access:</strong> vmkping -I vmk0 <vcenter_ip>. Also test from workstation: ping <esxi-mgmt-ip> and https://<esxi-ip>/ui (host client). If unreachable: check vmk0 IP config: esxcli network ip interface ipv4 get -i vmk0",
    "<strong>DRS Rebalancing:</strong> After exiting maintenance, DRS should begin migrating VMs back within 5 minutes (if Fully Automated). Monitor: vCenter > Host > VMs tab — count should increase. If VMs don't return: check DRS is enabled, host is not in quarantine, and resource availability",
    "<strong>vSAN Health:</strong> If host is in vSAN cluster: esxcli vsan health cluster list. In vCenter: Cluster > Monitor > vSAN > Health. All checks should return to green after host rejoin and resync completes. Monitor resync: esxcli vsan debug resync summary — wait for 0 objects before next host",
    "<strong>Software Profile:</strong> esxcli software profile get — verify profile name matches target (e.g., 'ESXi-8.0U3-standard'). Also: esxcli system version get — confirm build number matches expected. If mismatch: upgrade may have partially failed, retry from boot bank",
    "<strong>vMotion Test:</strong> In vCenter: right-click a small test VM on this host > Migrate > Change compute resource > Select another host. Should complete in < 30 seconds for a small VM. If fails: check vMotion VMkernel adapter enabled, vMotion network reachable between hosts",
    "<strong>Storage Paths:</strong> esxcli storage nmp path list. Every path should show state 'active' or 'standby' (for ALUA). If any path shows 'dead': check physical FC/iSCSI connectivity, zoning, and initiator login. Also: esxcli storage core path list -d <naa.xxx> for per-LUN detail",
    "<strong>VMFS Datastores:</strong> esxcli storage filesystem list. All VMFS/NFS datastores should show 'true' for mounted. If unmounted: esxcli storage filesystem mount -l <label>. If missing entirely: rescan storage adapters: esxcli storage core adapter rescan --all",
    "<strong>Build Verification:</strong> esxcli system version get. Output should show: Version: 8.0.3, Build: Buildnumber matching target exactly. Also verify: esxcli system boot device get — confirm still booting from expected device (not alternate boot bank)",
    "<strong>DVS Uplinks:</strong> If using Distributed Switch: esxcli network vswitch dvs vmware list — verify uplinks are connected. In vCenter: host > Configure > Virtual Switches > DVS uplinks should show 'Up'. If down: check physical NIC link state: esxcli network nic list"
  ],
  upgradeMethods: [
    { method: "vLCM Image-Based (Recommended)", desc: "Define a cluster image in vSphere Lifecycle Manager with ESXi base image + vendor add-on + firmware add-on → Check compliance → Remediate cluster (rolling, one host at a time). Handles firmware + drivers + ESXi in a single operation.", best: true, steps: "1) vCenter > Lifecycle Manager > Images > Import ESXi ISO | 2) Cluster > Updates > Image > Edit > Set base image + vendor add-on | 3) Add Hardware Support Manager (HSM) for firmware if needed | 4) Check Compliance on cluster | 5) Remediate: hosts enter maintenance one-by-one, VMs evacuated by DRS | 6) Each host reboots (~10-15 min), exits maintenance mode | 7) Verify all hosts show compliant after completion" },
    { method: "vLCM Baseline (Legacy VUM)", desc: "Import ESXi ISO into baseline → Attach baseline to cluster/host → Scan for compliance → Remediate. Legacy method still supported but cannot include firmware. Use when HSM is not available or for mixed-hardware clusters.", best: false, steps: "1) Lifecycle Manager > Import Updates > Upload ESXi ISO bundle | 2) Create Upgrade Baseline with the new ISO | 3) Attach baseline to target cluster or individual host | 4) Scan cluster for compliance | 5) Review non-compliant hosts | 6) Remediate: select hosts → Remediate → Accept EULA | 7) Hosts enter maintenance, upgrade, reboot, exit maintenance | 8) Monitor progress in Recent Tasks" },
    { method: "esxcli (Command-Line)", desc: "SSH to host → Stage depot ZIP on datastore → Run: esxcli software profile update -d /vmfs/volumes/<ds>/<depot.zip> -p <profile-name>. Best for scripted automation, remote sites, or when vCenter is unavailable. Requires host in maintenance mode first.", best: false, steps: "1) Place host in maintenance mode: esxcli system maintenanceMode set --enable true | 2) Upload depot ZIP to datastore: scp VMware-ESXi-8.0U3-depot.zip root@host:/vmfs/volumes/ds1/ | 3) List available profiles: esxcli software sources profile list -d /vmfs/volumes/ds1/depot.zip | 4) Update: esxcli software profile update -d /vmfs/volumes/ds1/depot.zip -p ESXi-8.0U3-standard | 5) Verify: esxcli software profile get | 6) Reboot: reboot | 7) Exit maintenance: esxcli system maintenanceMode set --enable false" },
    { method: "ISO Interactive (Boot Media)", desc: "Boot host from ESXi installer ISO via iLO/iDRAC/KVM → Select existing ESXi installation → Choose 'Upgrade'. Preserves VMFS datastores and host configuration. Best for standalone hosts, lab environments, or initial deployment with no vCenter.", best: false, steps: "1) Mount ISO via iLO/iDRAC/CIMC virtual media or USB | 2) Set boot order to boot from ISO | 3) Boot into ESXi installer | 4) Select 'ESXi Installer' at boot menu | 5) Accept EULA | 6) Select disk with existing ESXi (shows 'upgrade available') | 7) Choose 'Upgrade ESXi, preserve VMFS datastore' | 8) Confirm and wait for install (~5-8 min) | 9) Remove ISO, reboot to upgraded ESXi | 10) Verify build: esxcli system version get" }
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
