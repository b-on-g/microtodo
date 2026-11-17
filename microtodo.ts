namespace $ {

	export class $bog_microtodo_step extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Done: $giper_baza_atom_bool,
	}) {}

	export class $bog_microtodo_task extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Done: $giper_baza_atom_bool,
		Important: $giper_baza_atom_bool,
		Due: $giper_baza_atom_text,
		Repeat: $giper_baza_atom_text,
		Note: $giper_baza_atom_text,
		Steps: $giper_baza_list_link.to( ()=> $bog_microtodo_step ),
		Created: $giper_baza_atom_real,
		Finished: $giper_baza_atom_real,
	}) {}

	export class $bog_microtodo_list extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Tasks: $giper_baza_list_link.to( ()=> $bog_microtodo_task ),
	}) {}

	export class $bog_microtodo_home extends $giper_baza_dict.with({
		Inbox: $giper_baza_list_link.to( ()=> $bog_microtodo_task ),
		Lists: $giper_baza_list_link.to( ()=> $bog_microtodo_list ),
		Day: $giper_baza_dict_to( $giper_baza_atom_text ),
	}, 'bog_microtodo' ) {}

	export function $bog_microtodo_day( shift = 0 ) {
		return new $mol_time_moment().shift({ day: shift }).toString( 'YYYY-MM-DD' )
	}

	export function $bog_microtodo_due_next( due: string, repeat: string ) {
		const moment = new $mol_time_moment( due )
		if( repeat === 'day' ) return moment.shift({ day: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'week' ) return moment.shift({ day: 7 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'month' ) return moment.shift({ month: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'year' ) return moment.shift({ year: 1 }).toString( 'YYYY-MM-DD' )
		if( repeat === 'weekday' ) {
			let next = moment.shift({ day: 1 })
			while( next.weekday >= $mol_time_moment_weekdays.saturday ) next = next.shift({ day: 1 })
			return next.toString( 'YYYY-MM-DD' )
		}
		return ''
	}

	export function $bog_microtodo_due_label( due: string ) {
		if( !due ) return ''
		if( due === $bog_microtodo_day() ) return 'Сегодня'
		if( due === $bog_microtodo_day( 1 ) ) return 'Завтра'
		if( due === $bog_microtodo_day( -1 ) ) return 'Вчера'
		return new $mol_time_moment( due ).toString( 'WD, D Month', 'ru' )
	}

}
