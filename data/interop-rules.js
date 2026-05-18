const INTEROP_RULES = {
  rules: [
    {
      id: "vcenter-esxi-major",
      from: "vcenter",
      to: "esxi",
      check: function(vcenter, esxi) {
        var vcMajor = parseFloat(vcenter);
        var esxiMajor = parseFloat(esxi);
        return vcMajor >= esxiMajor;
      },
      severity: "error",
      message: "vCenter Server version must be equal to or greater than ESXi major version. Upgrade vCenter first."
    },
    {
      id: "vcenter6-esxi8",
      from: "vcenter",
      to: "esxi",
      check: function(vcenter, esxi) {
        var vcMajor = parseFloat(vcenter);
        var esxiMajor = parseFloat(esxi);
        if (vcMajor < 7.0 && esxiMajor >= 8.0) return false;
        return true;
      },
      severity: "error",
      message: "vCenter 6.x cannot manage ESXi 8.0 hosts. You must upgrade vCenter to at least 7.0 U3 or 8.0 before adding ESXi 8.0 hosts."
    },
    {
      id: "vcenter7-pre-u3-esxi8",
      from: "vcenter",
      to: "esxi",
      check: function(vcenter, esxi) {
        var esxiMajor = parseFloat(esxi);
        if (esxiMajor >= 8.0 && (vcenter === "7.0" || vcenter === "7.0u1" || vcenter === "7.0u2")) return false;
        return true;
      },
      severity: "error",
      message: "vCenter 7.0 prior to U3 has limited or no support for ESXi 8.0 hosts. Upgrade vCenter to 7.0 U3 or later, or preferably 8.0."
    },
    {
      id: "vsan-odf-esxi",
      from: "vsan",
      to: "esxi",
      check: function(vsan, esxi) {
        var vsanMajor = parseFloat(vsan);
        var esxiMajor = parseFloat(esxi);
        if (vsanMajor >= 8.0 && esxiMajor < 8.0) return false;
        if (vsanMajor >= 7.0 && esxiMajor < 7.0) return false;
        return true;
      },
      severity: "error",
      message: "vSAN On-Disk Format version requires compatible ESXi hosts. All hosts must be upgraded to the matching ESXi version before upgrading vSAN ODF."
    },
    {
      id: "nsx4-vcenter8",
      from: "nsx",
      to: "vcenter",
      check: function(nsx, vcenter) {
        var nsxMajor = parseFloat(nsx);
        var vcMajor = parseFloat(vcenter);
        if (nsxMajor >= 4.0 && vcMajor < 8.0) return false;
        return true;
      },
      severity: "error",
      message: "NSX 4.x requires vCenter 8.0 or later. Upgrade vCenter to 8.0 before upgrading NSX to 4.x."
    },
    {
      id: "nsx3-esxi8u2",
      from: "nsx",
      to: "esxi",
      check: function(nsx, esxi) {
        var nsxMajor = parseFloat(nsx);
        if (nsxMajor < 4.0 && (esxi === "8.0u2" || esxi === "8.0u3" || esxi === "8.0u3a" || esxi === "8.0u3b" || esxi === "8.0u3c")) return false;
        return true;
      },
      severity: "error",
      message: "NSX 3.x is not compatible with ESXi 8.0 U2 or later. Upgrade NSX to 4.x before upgrading ESXi beyond 8.0 U1."
    },
    {
      id: "esxi8-usb-sd-boot",
      from: "esxi",
      to: "esxi",
      check: function(from, to) {
        var toMajor = parseFloat(to);
        if (toMajor >= 8.0) return false;
        return true;
      },
      severity: "warning",
      message: "ESXi 8.0 no longer supports USB/SD card as a boot device. If your hosts boot from USB/SD, you must migrate to a supported boot device (SSD, NVMe, or SAN) before upgrading."
    }
  ],
  vcfBom: {
    "4.5": { vcenter: "7.0u3", esxi: "7.0u3", nsx: "3.2.1", vsan: "7.0u3" },
    "4.5.1": { vcenter: "7.0u3", esxi: "7.0u3", nsx: "3.2.1", vsan: "7.0u3" },
    "4.5.2": { vcenter: "7.0u3n", esxi: "7.0u3n", nsx: "3.2.3", vsan: "7.0u3" },
    "5.0": { vcenter: "8.0u1", esxi: "8.0u1", nsx: "4.1.0", vsan: "8.0u1" },
    "5.1": { vcenter: "8.0u2", esxi: "8.0u2", nsx: "4.1.2", vsan: "8.0u2" },
    "5.1.1": { vcenter: "8.0u2", esxi: "8.0u2", nsx: "4.1.2", vsan: "8.0u2" },
    "5.2": { vcenter: "8.0u3", esxi: "8.0u3", nsx: "4.2.0", vsan: "8.0u3" },
    "5.2.1": { vcenter: "8.0u3a", esxi: "8.0u3a", nsx: "4.2.1", vsan: "8.0u3" },
    "9.0": { vcenter: "8.0u3c", esxi: "8.0u3c", nsx: "4.2.1", vsan: "8.0u3" }
  },
  evaluate: function(selections) {
    var results = [];
    var self = this;
    self.rules.forEach(function(rule) {
      var fromVal = selections[rule.from];
      var toVal = selections[rule.to];
      if (fromVal && toVal) {
        var passed = rule.check(fromVal, toVal);
        if (!passed) {
          results.push({
            severity: rule.severity,
            message: rule.message,
            ruleId: rule.id
          });
        }
      }
    });
    return results;
  }
};
