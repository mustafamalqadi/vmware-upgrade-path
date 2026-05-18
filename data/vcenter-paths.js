const VCENTER_DATA = {
  product: "vCenter Server",
  icon: "&#127970;",
  color: "#58a6ff",
  versions: [
    { id: "6.5", label: "6.5", eol: true, release: "2016-11", build: "4944578" },
    { id: "6.5u1", label: "6.5 U1", eol: true, release: "2017-07", build: "5973321" },
    { id: "6.5u2", label: "6.5 U2", eol: true, release: "2018-05", build: "8815520" },
    { id: "6.5u3", label: "6.5 U3", eol: true, release: "2019-04", build: "13643870" },
    { id: "6.7", label: "6.7", eol: true, release: "2018-04", build: "8546234" },
    { id: "6.7u1", label: "6.7 U1", eol: true, release: "2018-10", build: "10244857" },
    { id: "6.7u2", label: "6.7 U2", eol: true, release: "2019-04", build: "13643639" },
    { id: "6.7u3", label: "6.7 U3", eol: true, release: "2019-08", build: "14367737" },
    { id: "7.0", label: "7.0", eol: false, release: "2020-04", build: "15952599" },
    { id: "7.0u1", label: "7.0 U1", eol: false, release: "2020-10", build: "17004997" },
    { id: "7.0u2", label: "7.0 U2", eol: false, release: "2021-03", build: "17694817" },
    { id: "7.0u3", label: "7.0 U3", eol: false, release: "2021-10", build: "19234570" },
    { id: "7.0u3n", label: "7.0 U3n", eol: false, release: "2023-03", build: "21958395" },
    { id: "7.0u3p", label: "7.0 U3p", eol: false, release: "2023-07", build: "22357613" },
    { id: "8.0", label: "8.0", eol: false, release: "2022-10", build: "20519528" },
    { id: "8.0u1", label: "8.0 U1", eol: false, release: "2023-04", build: "21560480" },
    { id: "8.0u2", label: "8.0 U2", eol: false, release: "2023-09", build: "22385739" },
    { id: "8.0u3", label: "8.0 U3", eol: false, release: "2024-06", build: "24022515" },
    { id: "8.0u3a", label: "8.0 U3a", eol: false, release: "2024-08", build: "24305601" },
    { id: "8.0u3b", label: "8.0 U3b", eol: false, release: "2024-11", build: "24601789" },
    { id: "8.0u3c", label: "8.0 U3c", eol: false, release: "2025-02", build: "25020103" }
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
      "<strong>Verify Build Number:</strong> VAMI > Summary or SSH: rpm -qa | grep vpxd. Must match expected source exactly. If mismatch, you may be on a different patch level — confirm before proceeding",
      "<strong>File-Based Backup:</strong> VAMI (https://vcsa:5480) > Backup > Backup Now > Protocol: SFTP/NFS. Verify status shows 'Succeeded'. Store externally (not on VCSA itself). Keep last 3 backups. Estimated time: 5-15 min depending on DB size",
      "<strong>VM Snapshot:</strong> vCenter > Right-click VCSA VM > Snapshots > Take Snapshot > ✓ Include Memory > ✓ Quiesce Guest FS. Label: 'pre-upgrade-<date>'. This is your fastest rollback (revert < 2 min). Delete within 72h post-upgrade if successful",
      "<strong>Host Connectivity:</strong> vCenter > Hosts & Clusters. All hosts must show green 'Connected' icon. If Disconnected: right-click > Connection > Reconnect. If Not Responding: check management network, vpxa service on host. Fix ALL before upgrade",
      "<strong>DNS Validation:</strong> SSH to VCSA: nslookup $(hostname -f) — must return VCSA IP. Then: nslookup <vcsa-ip> — must return FQDN. Test from EACH management subnet. Broken DNS = failed upgrade. Fix in DNS server before proceeding",
      "<strong>Port Verification:</strong> From VCSA: curl -sk https://localhost:443 (expect HTML). From any ESXi host: nc -zv <vcsa-ip> 443 5480 9087. Required ports: 443 (API/UI), 5480 (VAMI), 9087 (Analytics), 2012/2020 (vCenter HA). Blocked ports = upgrade timeout",
      "<strong>NTP Sync:</strong> SSH to VCSA: timedatectl — verify 'NTP synchronized: yes'. On each ESXi: esxcli system time get. Max allowed clock skew: 1 second between any components. If drifted: ntpdate -u <ntp-server> or fix NTP config",
      "<strong>Disk Space:</strong> SSH to VCSA: df -h / /storage /var/log. Minimum required: / > 2GB free, /storage > 10GB (staging area), /var/log > 5GB. If low: clean with logrotate, or remove old /var/log/vmware/vpxd/*.log files",
      "<strong>SSO Health:</strong> SSH to VCSA: /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus -h localhost -u administrator -w <pass>. Expected: all partners show 'Available: Yes'. If 'No': do NOT upgrade — fix replication first using vdcrepadmin -f fixreplication",
      "<strong>Plugin Inventory:</strong> Browse https://vcsa/mob > content > ExtensionManager > extensionList. Document all plugins. Cross-reference each with vendor compatibility matrix for target version. Remove unsupported plugins: Extension > UnregisterExtension",
      "<strong>Credential Verification:</strong> Test SSH as root (ssh root@vcsa). Test vSphere Client login as administrator@vsphere.local. Know the VCSA backup encryption passphrase. If any expired: VAMI > Access for root, or dcli com vmware appliance localaccounts user set for SSO",
      "<strong>AD/LDAP Test:</strong> SSH to VCSA: ldapsearch -H ldaps://<dc-fqdn>:636 -D '<bind-dn>' -w '<pass>' -b '<base-dn>' '(cn=test)'. Must return results. If TLS error: check trusted CA cert. If timeout: check firewall/DNS to domain controllers"
    ],
    "6.5u3->6.7u3": [
      "<strong>PSC Convergence (Mandatory):</strong> External Platform Services Controller (PSC) topology MUST be converged to embedded before upgrading to 6.7. Use the convergence tool in the 6.7 installer: /usr/lib/vmware-vmdir/bin/vdcrepadmin. If multiple PSCs: converge all before upgrade. External PSC is not supported in 6.7+",
      "<strong>Migration Assistant:</strong> Run VMware Migration Assistant on the source VCSA: mount ISO > run migration-assistant on source appliance. This pre-validates: disk space, network config, database size, service health. Resolve all warnings/errors before proceeding with actual upgrade",
      "<strong>Plugin Compatibility:</strong> Verify ALL registered plugins support vCenter 6.7: vSAN, NSX Manager, SRM, vROps/Aria, Horizon, vRA. Check: Administration > Client Plug-Ins. Incompatible plugins cause UI errors or functionality loss. Contact vendors for 6.7-compatible plugin versions before upgrade",
      "<strong>TLS Certificate Hash:</strong> Check custom TLS certificates: openssl x509 -in /etc/vmware/ssl/rui.crt -text | grep 'Signature Algorithm'. Must show sha256WithRSAEncryption. SHA-1 certs cause service startup failures post-upgrade. Regenerate with SHA-256 if SHA-1 detected",
      "<strong>Directory Replication:</strong> If multi-site: /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus -h localhost -u administrator@vsphere.local -w <pass>. All partners must show 'Available' and replication lag < 60 seconds. If 'Unavailable': fix replication before upgrade — broken vmdir = authentication failure",
      "<strong>Permissions Export:</strong> PowerCLI: Get-VIPermission | Select Entity, Principal, Role | Export-Csv C:\\pre-upgrade-perms.csv. Also: Get-VIRole | Select Name, PrivilegeList | Export-Csv C:\\pre-upgrade-roles.csv. This documents custom roles and permission assignments for post-upgrade validation",
      "<strong>vCenter HA Removal:</strong> If using vCenter HA (Active/Passive/Witness): MUST remove HA configuration BEFORE upgrade. vCenter > Configure > vCenter HA > Remove. Upgrade with HA active = guaranteed failure. Reconfigure HA after successful upgrade and validation"
    ],
    "6.7u3->7.0": [
      "<strong>PSC Convergence (Required):</strong> External PSC MUST be converged to embedded — the converge tool is built into vCenter 6.7 U1+. Run: /usr/lib/vmware-vmdir/bin/vdcrepadmin. If converge fails: check vmdir replication health first. 7.0 completely removes external PSC support — no workaround",
      "<strong>Directory Service Health:</strong> /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus -h localhost. All replication partners must show 'Available'. Also check: /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showservers -h localhost. Verify all expected nodes listed. Fix replication gaps before upgrade",
      "<strong>ESXi Minimum Version:</strong> vCenter 7.0 drops support for ESXi 6.0 and older. Verify ALL managed hosts: Get-VMHost | Select Name, Version (PowerCLI). Minimum: ESXi 6.5 U2. If any hosts at 6.0.x: upgrade ESXi FIRST or disconnect those hosts before vCenter upgrade",
      "<strong>Flash Client Removal:</strong> The vSphere Web Client (Flash) is COMPLETELY REMOVED in 7.0. All automation using Flash-based SDK or Web Client URLs must be migrated to HTML5 vSphere Client or REST API. Test all scripts/bookmarks that reference :9443 or /vsphere-client/. Update to /ui endpoints",
      "<strong>Enhanced Linked Mode:</strong> If using multiple vCenters in ELM: confirm SSO domain replication is healthy. Run on each VCSA: /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus. All partners = 'Available'. Upgrade vCenters one at a time — never simultaneously. Keep at least one vCenter available",
      "<strong>Certificate Backup:</strong> SSH to VCSA: cp -r /etc/vmware-vpx/ssl /root/ssl-backup-vpx && cp -r /etc/vmware/ssl /root/ssl-backup-vmware. Also backup: /usr/lib/vmware-vmafd/bin/dir-cli trustedcert list. If custom certs: backup private keys separately. Certs may need re-application post-upgrade",
      "<strong>DVS Config Export:</strong> For each Distributed Switch: vSphere Client > Networking > right-click DVS > Settings > Export Configuration > Export All. Save ZIP file externally. If DVS configuration corrupts during upgrade: import from backup. Critical for environments with complex port group policies",
      "<strong>VMware Tools Version:</strong> PowerCLI: Get-VM | Where {$_.ExtensionData.Guest.ToolsVersionStatus -eq 'guestToolsNeedUpgrade'} | Select Name. Upgrade VMware Tools to 11.x+ before vCenter upgrade. Old Tools may lose some guest OS interaction features with vCenter 7.0. Schedule Tools upgrades in next maintenance window",
      "<strong>SRM/vSphere Replication:</strong> If using Site Recovery Manager or vSphere Replication: check VMware Interoperability Matrix for compatibility with vCenter 7.0. Plan coordinated upgrade: vCenter first, then SRM/VR. If SRM version incompatible with 7.0: upgrade SRM to compatible version first or break pairing temporarily"
    ],
    "7.0u3->8.0": [
      "<strong>ESXi Host Minimum:</strong> vCenter 8.0 requires minimum ESXi 7.0 U2. Verify: Get-VMHost | Select Name, Version, Build (PowerCLI). If any host below 7.0 U2: upgrade those hosts BEFORE vCenter upgrade. vCenter 8.0 will refuse to manage older hosts — they'll appear disconnected",
      "<strong>VAMI Health Check:</strong> Browse https://<vcsa>:5480 > Health tab. All categories must show green. If 'Database' shows warning: may indicate DB fragmentation — run /opt/vmware/vpostgres/current/bin/vacuumdb --all on the postgres DB. Resolve ALL critical items before upgrade",
      "<strong>vLCM Image Compliance:</strong> If using vLCM image-based management: vCenter > Lifecycle Manager > check all cluster images. Run compliance check. Remediate any drift BEFORE upgrading vCenter. Post-upgrade vLCM may behave differently with pre-existing drift — clean state preferred",
      "<strong>Deprecated Features:</strong> Review deprecated features: vSphere Client customization spec format changed (migrate to new format), Content Library sync behavior updated (verify subscriptions), Performance charts rendering changed. Test any UI-dependent workflows in lab with 8.0 if possible",
      "<strong>Root Partition Space:</strong> SSH to VCSA: df -h / — must show > 10GB free. Also check: df -h /storage/log and /storage/db. If any > 85% full: clean old logs: find /var/log/vmware -name '*.log.*' -mtime +30 -delete. Database growth: run vacuum on postgres",
      "<strong>DRS/HA Configuration:</strong> Review: vCenter > Cluster > Configure > DRS (check mode, threshold), HA (check admission control policy, VM monitoring). Document settings. Verify no orphaned resource pools (click each, check for VMs). Invalid affinity rules: right-click rule > check status. Fix before upgrade",
      "<strong>Trust Authority:</strong> If using vSphere Trust Authority: verify Attestation Service configuration and Key Provider connectivity. Document: which hosts are attested, which KMS servers are configured. Trust Authority config should survive upgrade but verify certificates and connectivity post-upgrade",
      "<strong>Automation API Audit:</strong> Review vCenter 8.0 release notes 'Removed/Deprecated APIs' section. Common removals: some MOB endpoints, old performance counter IDs, SOAP-only methods. Search automation codebase for deprecated API calls. Update scripts to use REST equivalents before upgrade",
      "<strong>Backup Integrity Test:</strong> Take file-level backup: VAMI > Backup > Backup Now. If possible: restore to an isolated lab vCenter to verify backup integrity. If lab unavailable: at minimum verify backup file size is reasonable (>5GB for populated vCenter) and restore documentation is available"
    ],
    "7.0u3->8.0u3": [
      "<strong>Direct Jump Safety:</strong> Direct jump from 7.0 U3 to 8.0 U3 is supported — but higher risk than incremental. Take BOTH: file-based backup (VAMI > Backup) AND VM-level snapshot of VCSA. Label snapshot 'pre-8.0U3-direct-upgrade'. If upgrade fails: revert snapshot for instant rollback. Keep snapshot for 48 hours post-success",
      "<strong>Pre-Upgrade Compatibility Checker:</strong> Mount 8.0 U3 ISO on workstation. Run: vcsa-deploy upgrade --precheck-only /path/to/template.json (CLI) OR use GUI installer Stage 1 pre-check. This validates: source version compatibility, network requirements, disk space, certificates, database size. Fix all reported issues",
      "<strong>Certificate Audit:</strong> SSH to VCSA: for store in MACHINE_CERT VPXD VSPHERE-WEBCLIENT; do echo '---'$store'---'; /usr/lib/vmware-vmafd/bin/vecs-cli entry list --store $store; done. Check expiry: /usr/lib/vmware-vmafd/bin/certool --info --cert=/path. Any cert expiring < 30 days: renew BEFORE upgrade",
      "<strong>vmdir Database Integrity:</strong> /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus -h localhost -u administrator@vsphere.local. Must show all partners 'Available' with 'usn' values close together (< 100 difference). If partners diverged: resolve replication conflict before upgrade",
      "<strong>Intermediate Version Review:</strong> Since jumping 7.0U3→8.0U3 skips 8.0/8.0U1/8.0U2: review release notes for ALL intermediate versions. Check 'Behavioral Changes' and 'Deprecated Features' sections of each. Some features removed in 8.0U1 may break your workflows — address proactively",
      "<strong>Custom OS Modifications:</strong> SSH to VCSA: check /etc/cron.d/ (custom cron jobs), /etc/rc.local (startup scripts), /etc/systemd/system/ (custom units). These may NOT survive major upgrade (new appliance deployed). Document and plan to re-apply post-upgrade if still needed"
    ]
  },
  postChecks: [
    "<strong>Service Verification:</strong> SSH to VCSA: service-control --status --all. Expect 17-22 services all showing 'Running'. If any stopped: service-control --start <name>. Common: vmware-vpxd may take 3-5 min to fully start after upgrade. Wait before troubleshooting",
    "<strong>UI Login Test:</strong> Browse https://vcsa/ui in Chrome/Edge. Login as administrator@vsphere.local. Verify: full inventory tree loads, all clusters/hosts/VMs visible, build number in Help > About matches target. If blank page: clear browser cache, try incognito",
    "<strong>AD Authentication:</strong> Logout of vSphere Client. Login with AD domain account (e.g., DOMAIN\\admin). Verify correct permissions are applied. If login fails: check Administration > SSO > Identity Sources — AD connection may need re-binding",
    "<strong>Alarm Review:</strong> Home > Monitor > Issues & Alarms > Triggered Alarms. Filter to last 2 hours. Common post-upgrade alarms: cert warnings (renew within 7 days), license alerts (re-apply key), host comm (wait for vpxa reconnect). Address all critical alarms",
    "<strong>DRS Validation:</strong> Right-click a non-critical VM > Migrate > Change compute resource > Select different host > Finish. Should complete in < 30 seconds. If fails with 'vMotion network not configured': verify VMkernel adapters have vMotion enabled",
    "<strong>HA Validation:</strong> On a test host (non-production VMs): temporarily disconnect management NIC or run: esxcli network ip interface set -e false -i vmk0. HA should restart VMs on other hosts within 2-3 min. Reconnect immediately after confirming",
    "<strong>Storage vMotion Test:</strong> Right-click test VM > Migrate > Change storage only > Select different datastore > Finish. Validates storage connectivity and VMFS access post-upgrade. Should complete based on disk size (1GB/min typical)",
    "<strong>Lifecycle Manager:</strong> Menu > Lifecycle Manager. Verify: all imported ISOs still listed, cluster baselines still attached, vLCM images still defined with correct firmware add-ons. If missing: re-import from depot — bindings are stored in DB and should survive upgrade",
    "<strong>Content Library:</strong> If using Subscribed libraries: right-click > Sync Library. Wait for completion. Verify templates download successfully. If sync fails: check Publishing vCenter connectivity and HTTPS certificate trust between vCenters",
    "<strong>Disk Usage Check:</strong> SSH to VCSA: df -h / /storage /var/log. Compare with pre-upgrade baseline. vCenter 8.x uses 3-5GB more than 7.x on /storage. If > 80% used: schedule log cleanup via logrotate or VAMI > Monitoring > Disk Usage alerts",
    "<strong>Automation Verification:</strong> VAMI > Backup > Schedule — verify next backup is scheduled. vSphere Client > Cluster > Configure > DRS — confirm 'Fully Automated'. HA > Admission Control — verify policy unchanged. Alarms > Email notifications — send test",
    "<strong>vCenter HA:</strong> If previously used: Configure > vCenter HA > Set Up. Deploy Passive and Witness nodes. Wait for initial sync (10-30 min depending on DB size). Verify: all 3 nodes show 'Running' and replication lag < 30 seconds",
    "<strong>Performance Baseline:</strong> Navigate through vSphere Client: open host summary, VM performance charts, storage views. Page load should be < 3 seconds. If slow: check vpxd.log for slow DB queries, verify VCSA has adequate CPU (4+ vCPU) and RAM (19+ GB for Small)"
  ],
  upgradeMethods: [
    { method: "GUI Installer (ISO Mount)", desc: "Mount VCSA ISO on workstation → Run installer from /vcsa-ui-installer/<os>/installer → Select 'Upgrade' → Stage 1 deploys new appliance alongside old → Stage 2 migrates data and cuts over. Requires network access from workstation to both old and new VCSA. Downtime begins at Stage 2 start.", best: true, steps: "1) Mount VCSA ISO on admin workstation | 2) Launch installer UI | 3) Select 'Upgrade' and connect to source VCSA | 4) Configure target appliance sizing (Tiny/Small/Medium/Large) | 5) Stage 1: New appliance deployed with temporary IP | 6) Stage 2: Services stopped on source, data migrated, IP swapped | 7) Verify login to new VCSA at original FQDN" },
    { method: "CLI Installer (JSON Template)", desc: "Create a JSON upgrade template with source/target parameters → Run: vcsa-deploy upgrade --accept-eula --no-ssl-certificate-verification /path/to/upgrade.json. Best for scripted, repeatable upgrades across multiple vCenters.", best: false, steps: "1) Copy upgrade template from ISO: /vcsa-cli-installer/templates/upgrade/ | 2) Edit JSON: set source VCSA, ESXi target host, network, passwords | 3) Run pre-check: vcsa-deploy upgrade --precheck-only /path/template.json | 4) Execute: vcsa-deploy upgrade --accept-eula /path/template.json | 5) Monitor progress in terminal output | 6) Verify login post-upgrade" },
    { method: "VAMI Patch (Minor Updates Only)", desc: "SSH to VCSA → Check: software-packages list --staged → Stage: software-packages stage --url or --iso → Install: software-packages install --staged. Only for same-major patches (7.0 U3n → 7.0 U3p, or 8.0 U2 → 8.0 U3). No new appliance deployed.", best: false, steps: "1) SSH to VCSA as root | 2) Check current: software-packages list --staged | 3) Attach ISO or configure URL repo | 4) Stage: software-packages stage --iso --acceptEulas | 5) Pre-check: software-packages list --staged (review what will change) | 6) Install: software-packages install --staged | 7) Services restart automatically (~15 min) | 8) Verify: vCenter build in VAMI summary" },
    { method: "VCF Lifecycle Manager", desc: "For VCF-managed environments ONLY: SDDC Manager downloads the bundle → Runs pre-checks → Orchestrates the full vCenter upgrade including HA failover handling. Do NOT use standalone ISO installer in VCF environments — it will break SDDC Manager inventory.", best: false, steps: "1) SDDC Manager > Lifecycle Management > Download bundle | 2) Pre-check runs automatically | 3) Schedule or start upgrade | 4) SDDC Manager deploys new VCSA, migrates, cuts over | 5) SDDC Manager updates its inventory | 6) Verify in SDDC Manager dashboard" }
  ],
  knownIssues: {
    "7.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase5.html#kb-42' target='_blank'>KB #42 — vpxd Service Crash</a>: vCenter may show stale inventory after upgrade from 6.7. Resolution: Restart vpxd service and verify DB connections.",
    "8.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-11' target='_blank'>KB #11 — Certificate Expiry &amp; STS Token</a>: Custom SSL certificates may revert to VMCA-signed during upgrade. Re-apply custom certs post-upgrade.",
    "8.0u1": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-16' target='_blank'>KB #16 — SSO / AD Integration</a>: LDAPS connections may fail if intermediate CA certificates are not in the trusted store.",
    "8.0u2": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase8.html#kb-75' target='_blank'>KB #75 — vLCM Image-Based Updates</a>: vLCM image compliance checks may report false negatives after upgrade. Run remediation scan.",
    "8.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase5.html#kb-49' target='_blank'>KB #49 — vCenter HA Failover</a>: vCenter HA failover may take longer than expected on first failover post-upgrade. Reconfigure vCenter HA."
  },
  estimatedDowntime: {
    _default: "30-60 minutes",
    migration: "60-90 minutes"
  }
};
