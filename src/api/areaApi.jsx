import axios from "axios";

const BASE = "https://liftakids.koyeb.app/LiftAKids/api";

// ==================== Division ====================
export const getDivisions = () => axios.get(`${BASE}/divisions`);
export const createDivision = (data) => axios.post(`${BASE}/divisions`, data);
export const updateDivision = (divisionId, data) => axios.put(`${BASE}/divisions/${divisionId}`, data);
export const deleteDivision = (id) => axios.delete(`${BASE}/divisions/${id}`);

// ==================== District ====================

export const getDistricts = () => axios.get(`${BASE}/districts`);

export const getAllDistricts = (page = 0, size = 5) =>
    axios.get(`${BASE}/districts/all`, { params: { page, size } });

// export const getDistrictsByDivision = (divisionId) =>
//     axios.get(`${BASE}/districts/divisions/${divisionId}/districts`);

export const getDistrictsByDivision = (divisionId) => {
  const url = `${BASE}/districts/divisions/${divisionId}/districts`;
  console.log(" Fetching districts with divisionId:", divisionId);
  console.log(" Full API URL:", url);

  return axios.get(url);
};



export const createDistrict = (data) => {
  // Create payload with explicit type conversion
  const payload = {
    districtName: String(data.districtName),
    divisionId: parseInt(data.divisionId, 10) // Force number conversion
  };

  return axios.post(`${BASE}/districts`, payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    transformRequest: [(data) => JSON.stringify(data)], // Ensure proper serialization
    withCredentials: true
  });
};

export const updateDistrict = (id, data) => axios.put(`${BASE}/districts/${id}`, data);
export const deleteDistrict = (id) => axios.delete(`${BASE}/districts/${id}`);

// ==================== Thana ====================
export const getThanas = () => axios.get(`${BASE}/thanas`);

export const getAllThanas = (page = 0, size = 5) =>
  axios.get(`${BASE}/thanas/all`, { params: { page, size } });   


export const getThanasByDistrict = (districtId) =>
  axios.get(`${BASE}/thanas/district/${districtId}/thanas`, );



export const createThana = (data) => axios.post(`${BASE}/thanas`, data);

export const getThanaById = async (id) => {
    const response = await api.get(`/thanas/${id}`);
    return response.data; // Ensure this includes divisionId and divisionName
  };
  
  export const updateThana = async (id, data) => {
    const response = await api.put(`/thanas/${id}`, data);
    return response.data;
  };
export const deleteThana = (id) => axios.delete(`${BASE}/thanas/${id}`);

// ==================== UnionOrArea ====================
export const getUnionsOrAreas = () => axios.get(`${BASE}/unions-or-areas`);

export const getAllUnions = (page = 0, size = 10, sort = 'unionOrAreaName,asc') =>
  axios.get(`${BASE}/unions-or-areas/all`, { 
    params: { 
      page, 
      size,
      sort 
    } 
  });

export const getUnionsByThana = (thanaId, page = 0, size = 10) =>
  axios.get(`${BASE}/unions-or-areas/by-thana-page`, {
    params: {
      thanaId,
      page,
      size,
      sort: 'name,asc' // Consistent sorting
    }
  });

// Alternative if you need non-paginated thana unions
export const getUnionsByThanaId = (thanaId) =>
  axios.get(`${BASE}/unions-or-areas/thana/${thanaId}`);

export const getUnionById = (id) => 
  axios.get(`${BASE}/unions-or-areas/${id}`);

export const createUnion = (data) => 
  axios.post(`${BASE}/unions-or-areas`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  export const getUnionsByDistrict = (districtId, page = 0, size = 10) => {
    return axios.get(`/api/unions-or-areas/by-district/${districtId}?page=${page}&size=${size}`);
  };
export const updateUnion = (id, data) => 
  axios.put(`${BASE}/unions-or-areas/${id}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

export const deleteUnion = (id) => 
  axios.delete(`${BASE}/unions-or-areas/${id}`);