/* ============================================================
   LeaveFlow — Storage & Seed Data
   ============================================================ */
const Storage = (() => {
  const K = { USER: 'lf_user', LEAVES: 'lf_leaves', NOTIFS: 'lf_notifs' };

  const get  = k => JSON.parse(localStorage.getItem(k) || 'null');
  const set  = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const del  = k => localStorage.removeItem(k);

  return {
    getUser:    () => get(K.USER),
    setUser:    u  => set(K.USER, u),
    clearUser:  () => del(K.USER),

    getLeaves:  () => get(K.LEAVES) || [],
    saveLeaves: l  => set(K.LEAVES, l),

    getNotifs:  () => get(K.NOTIFS) || [],
    saveNotifs: n  => set(K.NOTIFS, n),

    addLeave(leave) {
      const leaves = this.getLeaves();
      leaves.push(leave);
      this.saveLeaves(leaves);
    },

    updateLeave(id, patch) {
      const leaves = this.getLeaves();
      const i = leaves.findIndex(l => l.id === id);
      if (i < 0) return null;
      Object.assign(leaves[i], patch);
      this.saveLeaves(leaves);
      return leaves[i];
    },

    addNotif(notif) {
      const notifs = this.getNotifs();
      notifs.unshift({ ...notif, read: false, time: 'Just now' });
      this.saveNotifs(notifs);
    },

    unreadCount: () => (get(K.NOTIFS) || []).filter(n => !n.read).length,

    seed() {
      if (!localStorage.getItem(K.LEAVES)) {
        set(K.LEAVES, [
          { id:1, type:'medical',  from:'2026-03-05', to:'2026-03-06', days:2, reason:'Fever and cold',                 status:'Approved', remarks:'Approved. Get well soon!',  ts:'2026-03-04' },
          { id:2, type:'personal', from:'2026-03-18', to:'2026-03-18', days:1, reason:'Family function',                status:'Approved', remarks:'Approved.',                  ts:'2026-03-17' },
          { id:3, type:'academic', from:'2026-04-10', to:'2026-04-11', days:2, reason:'State-level coding competition', status:'Approved', remarks:'Approved. All the best!',    ts:'2026-04-08' },
          { id:4, type:'personal', from:'2026-04-20', to:'2026-04-21', days:2, reason:'Visiting relatives',             status:'Pending',  remarks:'—',                          ts:'2026-04-15' },
          { id:5, type:'medical',  from:'2026-04-28', to:'2026-04-28', days:1, reason:'Doctor appointment',             status:'Pending',  remarks:'—',                          ts:'2026-04-15' },
        ]);
      }
      if (!localStorage.getItem(K.NOTIFS)) {
        set(K.NOTIFS, [
          { type:'approved', msg:'Your leave for Apr 10–11 has been approved!',     time:'2 days ago',  read:false },
          { type:'pending',  msg:'Leave application for Apr 20–21 submitted.',      time:'1 day ago',   read:false },
          { type:'pending',  msg:'Leave application for Apr 28 submitted.',         time:'1 day ago',   read:false },
          { type:'approved', msg:'Leave for Mar 18 was approved.',                  time:'4 weeks ago', read:true  },
          { type:'approved', msg:'Medical leave for Mar 5–6 was approved.',         time:'6 weeks ago', read:true  },
        ]);
      }
    },
  };
})();
