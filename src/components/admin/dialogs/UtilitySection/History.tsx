import BackspaceIcon from '@mui/icons-material/Backspace';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useI18n } from 'next-rosetta';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../../../contexts';
import type { Locale } from '../../../../i18n';
import Section from '../../../sheet/Section';

const highlightStyle = { color: '#00a000', fontWeight: 'bold' };

type Dice = { name: string; dices: string; results: string; total?: string };

type HistoryProps = {
	players: { id: number; name: string }[];
};

const History: React.FC<HistoryProps> = (props) => {
	const [values, setValues] = useState<Dice[]>([]);
	const wrapper = useRef<HTMLDivElement>(null);
	const socket = useContext(SocketContext);
	const componentDidMount = useRef(false);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		setValues(JSON.parse(localStorage.getItem('admin_dice_history') || '[]') as Dice[]);
	}, []);

	useEffect(() => {
		if (!socket) return;

		socket.on('diceResult', (id, diceResponse, diceRequest, baseDice) => {
			let dices: string[];
			let total: string | undefined;

			const isRequestArray = Array.isArray(diceRequest);

			if (isRequestArray) {
				dices = diceRequest.map((dice) => {
					const num = dice.num;
					const roll = dice.roll;
					if (num && num > 0) return `${num}d${roll}`;
					return roll.toString();
				});
				total = diceResponse.reduce((acc, cur) => acc + cur.roll, 0).toString();
			} else if (diceRequest.num && diceRequest.num > 0) {
				dices = [`${diceRequest.num}d${baseDice}`];
			} else {
				dices = [baseDice.toString()];
			}

			const results = diceResponse.map((res) => {
				const roll = res.roll;
				if (res.description) return `${roll} (${res.description})`;
				return roll.toString();
			});

			const message: Dice = {
				name: props.players.find((p) => p.id === id)?.name || t('unknown'),
				dices: dices.join(' + '),
				results: results.join(isRequestArray ? ' + ' : ' | '),
				total,
			};

			setValues((values) => {
				if (values.length > 10) return [message, ...values.slice(1)];
				return [message, ...values];
			});
		});

		return () => {
			socket.off('diceResult');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	useEffect(() => {
		if (wrapper.current) wrapper.current.scrollTo({ top: 0, behavior: 'auto' });

		if (componentDidMount.current) {
			localStorage.setItem('admin_dice_history', JSON.stringify(values));
			return;
		}
		componentDidMount.current = true;
	}, [values]);

	return (
		<Section
			title='History'
			sideButton={
				<IconButton
					onClick={() => setValues((val) => (val.length === 0 ? val : []))}
					title={t('erase')}>
					<BackspaceIcon />
				</IconButton>
			}>
			<Box height={250} sx={{ overflowY: 'auto' }} ref={wrapper}>
				<List>
					{values.map((val, index) => (
						<Fragment key={index}>
							<ListItem>
								<ListItemText>
									<span style={highlightStyle}>{val.name} </span>
									rolou
									<span style={highlightStyle}> {val.dices} </span>e tirou
									<span style={highlightStyle}> {val.results}</span>
									{val.total ? (
										<>
											, totalizando <span style={highlightStyle}>{eval(val.results)}</span>.
										</>
									) : (
										'.'
									)}
								</ListItemText>
							</ListItem>
							{index < values.length - 1 && <Divider variant='middle' component='li' />}
						</Fragment>
					))}
				</List>
			</Box>
		</Section>
	);
};

export default History;
