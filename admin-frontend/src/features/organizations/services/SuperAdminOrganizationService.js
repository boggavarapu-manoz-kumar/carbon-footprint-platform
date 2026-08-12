import { adminAxios as api } from '../../../core/api';

class SuperAdminOrganizationService {
    createOrganization(data) {
        return api.post('/organizations', data);
    }

    getAllOrganizations() {
        return api.get('/organizations');
    }

    getOrganization(id) {
        return api.get(`/organizations/${id}`);
    }

    updateOrganizationStatus(id, status) {
        return api.put(`/organizations/${id}/status`, null, { params: { status } });
    }
}

export default new SuperAdminOrganizationService();
