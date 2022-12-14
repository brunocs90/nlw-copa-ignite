import { createContext, ReactNode, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { api } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
	name: string;
	avatarUrl: string;
}

export interface AuthContexDataProps {
	user: UserProps;
	singIn: () => Promise<void>;
	isUserLoading: boolean;
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext({} as AuthContexDataProps);

export function AuthContextProvider({ children }: AuthProviderProps) {
	const [isUserLoading, setIsUserLoading] = useState(false);
	const [user, setUser] = useState<UserProps>({} as UserProps);

	const [_, response, googleAuth] = Google.useAuthRequest({
		expoClientId: process.env.CLIENT_ID_EXPO,
		iosClientId: process.env.CLIENT_ID_IOS,
		androidClientId: process.env.CLIENT_ID_ANDROID,
		webClientId: process.env.CLIENT_ID_WEBAPP,
		selectAccount: true,
	});

	async function singIn() {
		try {
			setIsUserLoading(true)
			await googleAuth();
		} catch (error) {
			console.log(error);
			throw error;
		} finally {
			setIsUserLoading(false);
		}
	}

	async function singInWithGoogle(access_token: string) {
		//console.log('TOKEN DE AUTENTICAÇÃO ===>', access_token);
		try {
			setIsUserLoading(true);
			const tokenResponse = await api.post('/users', { access_token });
			api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`;

			const userInfoResponse = await api.get('/me');
			setUser(userInfoResponse.data.user);
		} catch (error) {
			console.log(error);
			throw error;
		} finally {
			setIsUserLoading(false);
		}
	}

	useEffect(() => {
		if (response?.type === 'success' && response.authentication?.accessToken) {
			singInWithGoogle(response.authentication.accessToken);
		}
	}, [response])

	return (
		<AuthContext.Provider value={{
			singIn,
			isUserLoading,
			user,
		}}>
			{children}
		</AuthContext.Provider>
	)
}