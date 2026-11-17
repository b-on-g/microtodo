namespace $.$$ {

	export class $bog_microtodo_details extends $.$bog_microtodo_details {

		task() {
			return this.$.$giper_baza_glob.Pawn( new $giper_baza_link( this.link() ), $bog_microtodo_task )
		}

		step( id: string ) {
			return this.$.$giper_baza_glob.Pawn( new $giper_baza_link( id ), $bog_microtodo_step )
		}

		title( next?: string ) {
			return this.task().Title( next === undefined ? undefined : 'auto' )?.val( next ) ?? ''
		}

		important( next?: boolean ) {
			return this.task().Important( next === undefined ? undefined : 'auto' )?.val( next ) ?? false
		}

		due( next?: string ) {
			return this.task().Due( next === undefined ? undefined : 'auto' )?.val( next ) ?? ''
		}

		repeat( next?: string ) {
			const stored = next === 'none' ? '' : next
			return this.task().Repeat( next === undefined ? undefined : 'auto' )?.val( stored ) || 'none'
		}

		note( next?: string ) {
			return this.task().Note( next === undefined ? undefined : 'auto' )?.val( next ) ?? ''
		}

		@ $mol_mem
		step_ids() {
			return ( this.task().Steps()?.items() ?? [] ).map( link => link.str )
		}

		step_rows() {
			return this.step_ids().map( id => this.Step( id ) )
		}

		step_title( id: string, next?: string ) {
			return this.step( id ).Title( next === undefined ? undefined : 'auto' )?.val( next ) ?? ''
		}

		step_done( id: string, next?: boolean ) {
			return this.step( id ).Done( next === undefined ? undefined : 'auto' )?.val( next ) ?? false
		}

		step_add_enabled() {
			return Boolean( this.step_title_new().trim() )
		}

		@ $mol_action
		step_add() {
			const title = this.step_title_new().trim()
			if( !title ) return
			const step = this.task().Steps( 'auto' )!.make( null )
			step.Title( 'auto' )!.val( title )
			this.step_title_new( '' )
		}

		@ $mol_action
		step_drop( id: string ) {
			this.task().Steps( 'auto' )!.cut( new $giper_baza_link( id ) )
		}

		myday_label() {
			return this.myday() ? 'Добавлено в «Мой день»' : super.myday_label()
		}

		created_label() {
			const created = this.task().Created()?.val()
			if( !created ) return ''
			return 'Создано ' + new $mol_time_moment( created ).toString( 'D Month', 'ru' )
		}

	}

}
