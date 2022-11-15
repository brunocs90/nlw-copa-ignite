import axios from 'axios';

export const api = axios.create({
	baseURL: 'https://back-copa-2022.herokuapp.com'
})