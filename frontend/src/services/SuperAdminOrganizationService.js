import api from '../api/axiosConfig';

class SuperAdminOrganizationService {
    createOrganization(data) {
        return api.post('/v1/admin/organizations', data);
    }

    getAllOrganizations() {
        return api.get('/v1/admin/organizations');
    }

    getOrganization(id) {
        return api.get(`/v1/admin/organizations/${id}`);
    }

    updateOrganizationStatus(id, status) {
        return api.put(`/v1/admin/organizations/${id}/status`, null, { params: { status } });
    }
}

export default new SuperAdminOrganizationService();
