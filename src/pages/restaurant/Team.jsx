import { useState, useEffect } from 'react';
import { Search, Plus, Mail, MoreVertical, User, Shield, UserCheck, Clock, RefreshCw } from 'lucide-react';
import { useRestaurant } from '../../features/restaurant/RestaurantContext';
import { teamService } from '../../services/team.service';
import toast from 'react-hot-toast';

const Team = () => {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openActionId, setOpenActionId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MANAGER');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTeam = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await teamService.getTeamMembers(restaurant.id);
      const raw = res.data || [];
      setTeamMembers(raw.map(m => ({
        id: m.id,
        name: m.user?.fullName || m.email?.split('@')[0] || 'User',
        email: m.email,
        role: m.role || 'STAFF',
        status: m.status === 'PENDING' ? 'Invited' : 'Active',
        lastActive: '—', // Could be added to backend later
        avatarColor: getRoleColor(m.role || 'STAFF'),
      })));
    } catch (err) {
      console.error('Failed to fetch team', err);
      toast.error('Could not load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [restaurant?.id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <UserCheck className="text-success" size={14} />;
      case 'Invited': return <Clock className="text-warning" size={14} />;
      case 'Suspended': return <Shield className="text-error" size={14} />;
      default: return null;
    }
  };

  const getRoleColor = (role) => {
    const rc = role?.toUpperCase();
    switch (rc) {
      case 'OWNER': return 'bg-primary/10 text-primary';
      case 'MANAGER': return 'bg-secondary/10 text-secondary';
      case 'STAFF': return 'bg-neutral-100 text-neutral-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch = !search ||
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search);
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !restaurant?.id) return;
    try {
      setActionLoading(true);
      await teamService.inviteMember(restaurant.id, email, inviteRole);
      toast.success('Invitation sent!');
      setInviteEmail('');
      setInviteRole('MANAGER');
      setShowInviteModal(false);
      fetchTeam(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?') || !restaurant?.id) return;
    try {
      setActionLoading(true);
      await teamService.removeMember(restaurant.id, memberId);
      toast.success('Member removed');
      fetchTeam();
    } catch (err) {
      toast.error('Could not remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = (id) => {
    setTeamMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.status === 'Suspended') return { ...m, lastActive: 'Just now', status: 'Active' };
      return { ...m, lastActive: 'Just now', status: 'Suspended' };
    }));
    setOpenActionId(null);
  };

  const handleRemove = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    setOpenActionId(null);
  };

  const handleResendInvite = (id) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, lastActive: 'Just now' } : m));
    setOpenActionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Team Management</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </div>

      {/* Top Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-3 w-full">
          <button onClick={fetchTeam} className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : 'text-neutral-500'}`} />
          </button>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Name</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Email</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Role</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Last Active</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" /></td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-neutral-500">
                    No team members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${member.avatarColor} flex items-center justify-center text-white`}>
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600">{member.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(member.status)}
                        <span>{member.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600">{member.lastActive}</td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionId(openActionId === member.id ? null : member.id)}
                          className="p-2 hover:bg-neutral-100 rounded-lg"
                        >
                          <MoreVertical size={20} className="text-neutral-600" />
                        </button>
                        {openActionId === member.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                            {member.status === 'Invited' && (
                              <button
                                onClick={() => handleResendInvite(member.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                              >
                                Resend Invite
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(member.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                            >
                              {member.status === 'Suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800">Invite Team Member</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="teammate@restaurant.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="OWNER">Owner - Full access</option>
                  <option value="MANAGER">Manager - Orders + Menu + Discounts + Hours</option>
                  <option value="STAFF">Staff - Live orders only</option>
                </select>
                <p className="text-sm text-neutral-500 mt-2">
                  Staff members can only view live orders and have view-only access to menu.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium mb-2">Permissions Summary</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Full dashboard access
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Manage team members
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    View and edit all orders
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={actionLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Mail size={16} />
                {actionLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
