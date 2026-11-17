namespace $ {

	$mol_style_define( $bog_microtodo_row, {
		align: {
			items: 'center',
		},
		background: {
			color: $mol_theme.card,
		},
		border: {
			radius: $mol_gap.round,
		},
		Open: {
			flex: {
				grow: 1,
				direction: 'column',
			},
			align: {
				items: 'flex-start',
			},
		},
		Meta: {
			color: $mol_theme.shade,
			font: {
				size: '.875rem',
			},
		},
		'@': {
			bog_microtodo_row_done: {
				true: {
					Title: {
						textDecoration: 'line-through',
						color: $mol_theme.shade,
					},
				},
			},
			bog_microtodo_row_overdue: {
				true: {
					Meta: {
						color: $mol_theme.special,
					},
				},
			},
		},
	} )

}
