/**
* @title 2-wrapper
* @description Wrapper: API readiness (GET /api/health) gates app; validation shows API status.
* @next ./src/App.tsx
*/

import React, { useState, useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import App from './App';
import {
	GuideBox,
	Panel,
	Typography,
	IconButton,
	Icon,
	Signature as SignatureMoaui,
} from '@midasit-dev/moaui';
import Signature from './Signature';
import {
	SnackbarProvider,
	closeSnackbar
} from 'notistack';
import { isDevServerListening } from './DevTools/ServerListening';
import DevKit from './DevTools/Kit';
import { getHealth } from './api/endpoints';
import { useTranslation } from "react-i18next";
import InnerContentSize from './InnerContentSize';

const ValidWrapper = (props: { isApiReady?: boolean }) => {
	const { isApiReady = false } = props;

	const [isInitialized] = React.useState(true);
	const [checkUri] = React.useState(false);
	const [checkMapiKey] = React.useState(false);
	const [checkMapiKeyMsg] = React.useState("");
	const { i18n } = useTranslation();

	const ValidationComponent = ({
		title = 'undefiend',
		checkIf = false,
		strValid = 'Valid',
		strInvalid = 'Invalid',
	}: any) => {
		return (
			<GuideBox row horSpaceBetween width={350}>
				<Typography variant="body1">{title}: </Typography>
				{checkIf ? (
					<Typography variant="h1" color="#1f78b4">{strValid}</Typography>
				) : (
					<Typography variant="h1" color="#D32F2F">{strInvalid}</Typography>
				)}
			</GuideBox>
		);
	}

	const [bgColor, setBgColor] = React.useState('#eee');
	React.useEffect(() => {
		fetch(`${process.env.PUBLIC_URL}/manifest.json`)
			.then(response => response.json())
			.then(data => data.name ? setBgColor(data.background_color) : null)
			.catch(error => console.error('Error fetching manifest.json:', error));
	}, []);

	React.useEffect(() => {
		if (isInitialized && isApiReady) {
			Signature.log();
			SignatureMoaui.log();
		}
	}, [isInitialized, isApiReady]);

	React.useEffect(() => {
		if (window.location.pathname === "/") window.location.pathname = "/en";
		i18n.changeLanguage(window.location.pathname.split("/")[1]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [window.location.pathname]);

	return (
		<>
			{isInitialized && isApiReady && (
				<RecoilRoot>
					<SnackbarProvider
						maxSnack={3}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						action={(key) => (
							<IconButton transparent transparentColor="white" onClick={() => closeSnackbar(key)}>
								<Icon iconName="Close" />
							</IconButton>
						)}
					>
						{process.env.NODE_ENV === 'development' && isDevServerListening() ?
							<DevKit bgColorState={[bgColor, setBgColor]}>
								<GuideBox tag="AppBackground" show center fill={bgColor} borderRadius='0 0 4px 4px' spacing={3}>
									<InnerContentSize>
										<App />
									</InnerContentSize>
								</GuideBox>
							</DevKit>
							:
							<GuideBox tag="AppBackground" show center fill={bgColor} width="100%">
								<App />
							</GuideBox>
						}
					</SnackbarProvider>
				</RecoilRoot>
			)}

			{isInitialized && !isApiReady && (
				<GuideBox width="100%" height="100vh" center>
					<Panel variant="shadow2" padding={3} margin={3}>
						<GuideBox opacity={0.9} spacing={2}>
							<Typography variant="h1">Validation Check</Typography>
							<GuideBox spacing={2}>
								<ValidationComponent title="API" checkIf={isApiReady} strValid="Valid" strInvalid="Not connected" />
								<ValidationComponent title="Base URI" checkIf={checkUri} strValid="Valid" strInvalid="Invalid" />
								<ValidationComponent title="MAPI-Key" checkIf={checkMapiKey} strValid="Valid" strInvalid={`Invalid (${checkMapiKeyMsg})`} />
							</GuideBox>
						</GuideBox>
					</Panel>
				</GuideBox>
			)}
		</>
	);
};

/** Mount 시 GET /api/health 호출, 성공 시 로딩 화면 숨기고 isApiReady 전달. */
function ApiWrapper() {
	const [isApiReady, setApiReady] = useState(false);
	useEffect(() => {
		getHealth()
			.then(() => {
				window.hideLoadingScreen?.();
				setApiReady(true);
			})
			.catch(() => {
				window.hideLoadingScreen?.();
				setApiReady(false);
			});
	}, []);
	return <ValidWrapper isApiReady={isApiReady} />;
}

export default ApiWrapper;