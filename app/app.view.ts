namespace $.$$ {

	const smart = [ 'myday', 'important', 'planned', 'inbox', 'search' ]

	export class $bog_microtodo_app extends $.$bog_microtodo_app {

		home() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_microtodo_home )
		}

		list( id: string ) {
			return this.$.$giper_baza_glob.Pawn( new $giper_baza_link( id ), $bog_microtodo_list )
		}

		task( id: string ) {
			return this.$.$giper_baza_glob.Pawn( new $giper_baza_link( id ), $bog_microtodo_task )
		}

		tasks_store( id: string ) {
			return id === 'inbox' ? this.home().Inbox( 'auto' )! : this.list( id ).Tasks( 'auto' )!
		}

		auto() {
			;( this.Settings() as $bog_microtodo_settings ).account_import()
			;( this.Settings().Install() as $bog_install ).listeners()
			this.merge_apply()
			this.join_apply()
			this.home()
		}

		settings_opened() {
			return this.$.$mol_state_arg.value( 'settings' ) !== null
		}

		list_id( next?: string ) {
			return this.$.$mol_state_arg.value( 'list', next ) ?? 'myday'
		}

		task_id( next?: string | null ) {
			return this.$.$mol_state_arg.value( 'task', next ) ?? ''
		}

		search( next?: string ) {
			return this.$.$mol_state_arg.value( 'search', next === undefined ? undefined : next || null ) ?? ''
		}

		list_current() {
			return this.search() ? 'search' : this.list_id()
		}

		pages() {
			if( this.settings_opened() ) return [ this.Menu(), this.Settings() ]
			const task = this.task_id()
			return [
				this.Menu(),
				this.List_page( this.list_current() ),
				... task ? [ this.Details( task ) ] : [],
			]
		}

		@ $mol_mem
		list_ids() {
			return ( this.home().Lists()?.items() ?? [] ).map( link => link.str )
		}

		list_links() {
			return this.list_ids().map( id => this.List_link( id ) )
		}

		list_arg( id: string ) {
			return { list: id, task: null, search: null, settings: null }
		}

		list_custom( id: string ) {
			return !smart.includes( id )
		}

		list_shared( id: string ) {
			return this.list_custom( id ) && new $giper_baza_link( id ).land().str !== this.home().land().link().str
		}

		List_icon( id: string ) {
			return this.list_shared( id ) ? this.List_shared_icon( id ) : this.List_plain_icon( id )
		}

		list_title( id: string, next?: string ) {
			if( id === 'myday' ) return this.myday_title()
			if( id === 'important' ) return this.important_title()
			if( id === 'planned' ) return this.planned_title()
			if( id === 'inbox' ) return this.inbox_title()
			if( id === 'search' ) return `Поиск «${ this.search() }»`
			return this.list( id ).Title( next === undefined ? undefined : 'auto' )?.val( next ) ?? ''
		}

		list_head( id: string ) {
			const page = this.List_page( id )
			return [ this.list_custom( id ) ? this.List_title_field( id ) : page.Title(), page.Tools() ]
		}

		list_tools( id: string ) {
			if( !this.list_custom( id ) ) return []
			return [
				... this.list_shared( id ) ? [] : [ this.List_share( id ) ],
				this.List_drop( id ),
			]
		}

		list_body( id: string ) {
			return [
				... id === 'search' ? [] : [ this.Add( id ) ],
				... this.list_shared( id ) ? [ this.Share( id ) ] : [],
				this.Rows( id ),
				... this.list_finished( id ).length ? [ this.Finished( id ) ] : [],
			]
		}

		list_land( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ).land() )
		}

		list_owned( id: string ) {
			const land = this.list_land( id )
			return land.lord_rank( land.auth().pass().lord() ) >= $giper_baza_rank_rule
		}

		lands_owned() {
			return this.list_ids()
				.filter( id => this.list_shared( id ) && this.list_owned( id ) )
				.map( id => this.list_land( id ) )
		}

		invite_key( id: string ) {
			return this.list( id ).Invite()?.val() ?? ''
		}

		invite_hidden( id: string ) {
			return this.list( id ).Invites()?.items() ?? []
		}

		share_hint( id: string ) {
			if( !this.list_land( id ).encrypted() ) return 'Список открыт всем, у кого есть ссылка'
			if( !this.invite_key( id ) ) return this.list_owned( id )
				? 'Ссылка закрыта. Новые участники не войдут, пока вы не создадите новую.'
				: 'Ссылку на список закрыл владелец.'
			return super.share_hint( id )
		}

		invite_tools( id: string ) {
			const key = this.invite_key( id )
			if( !this.list_owned( id ) ) return key ? [ this.Share_copy( id ) ] : []
			return key
				? [ this.Share_copy( id ), this.Invite_renew( id ), this.Invite_close( id ) ]
				: [ this.Invite_renew( id ) ]
		}

		invite_renew_title( id: string ) {
			return this.invite_key( id ) ? super.invite_renew_title( id ) : 'Создать ссылку'
		}

		invite_renew( id: string ) {
			$mol_wire_async( this ).invite_renew_run( id )
		}

		invite_renew_run( id: string ) {
			const land = this.list_land( id )
			$bog_microtodo_invite_close( land )
			$bog_microtodo_invite_make( land )
		}

		invite_close( id: string ) {
			$mol_wire_async( this ).invite_close_run( id )
		}

		invite_close_run( id: string ) {
			$bog_microtodo_invite_close( this.list_land( id ) )
		}

		share_link( id: string ) {
			const key = this.invite_key( id )
			return this.$.$mol_state_arg.make_link( key ? { join: id, invite: key } : { join: id } )
		}

		list_drop_hint( id: string ) {
			return this.list_shared( id ) ? 'Покинуть список' : super.list_drop_hint( id )
		}

		@ $mol_mem_key
		list_task_ids( id: string ) {
			const store = id === 'inbox' ? this.home().Inbox() : this.list( id ).Tasks()
			return ( store?.items() ?? [] ).map( link => link.str ).reverse()
		}

		@ $mol_mem
		task_owner() {
			const owner = new Map< string, string >()
			for( const list of [ 'inbox', ... this.list_ids() ] ) {
				for( const task of this.list_task_ids( list ) ) owner.set( task, list )
			}
			return owner
		}

		@ $mol_mem
		task_ids_all() {
			return [ ... this.task_owner().keys() ]
		}

		task_due( id: string ) {
			return this.task( id ).Due()?.val() ?? ''
		}

		@ $mol_mem_key
		list_tasks( id: string ): readonly string[] {
			const all = this.task_ids_all()
			if( id === 'myday' ) return all.filter( task => this.task_myday( task ) )
			if( id === 'important' ) return all.filter( task => this.task( task ).Important()?.val() )
			if( id === 'planned' ) return all.filter( task => this.task_due( task ) ).sort( ( a, b )=> this.task_due( a ) < this.task_due( b ) ? -1 : 1 )
			if( id === 'search' ) return all.filter( $mol_match_text( this.search(), task => [ this.task( task ).Title()?.val() ?? '', this.task( task ).Note()?.val() ?? '' ] ) )
			return this.list_task_ids( id )
		}

		@ $mol_mem_key
		list_open( id: string ) {
			return this.list_tasks( id ).filter( task => !this.task_done( task ) )
		}

		@ $mol_mem_key
		list_finished( id: string ) {
			const finished = ( task: string )=> this.task( task ).Finished()?.val() ?? 0
			return this.list_tasks( id )
				.filter( task => this.task_done( task ) )
				.sort( ( a, b )=> finished( b ) - finished( a ) )
		}

		task_rows( id: string ) {
			return this.list_open( id ).map( task => this.Row( task ) )
		}

		finished_rows( id: string ) {
			return this.list_finished( id ).map( task => this.Row( task ) )
		}

		finished_title( id: string ) {
			return `Завершённые ${ this.list_finished( id ).length }`
		}

		list_count( id: string ) {
			return this.list_open( id ).length
		}

		myday_count() {
			return this.list_count( 'myday' )
		}

		important_count() {
			return this.list_count( 'important' )
		}

		planned_count() {
			return this.list_count( 'planned' )
		}

		inbox_count() {
			return this.list_count( 'inbox' )
		}

		task_link( id: string ) {
			return id
		}

		task_arg( id: string ) {
			return { task: id }
		}

		task_list_title( id: string ) {
			const current = this.list_current()
			if( current === 'inbox' || this.list_custom( current ) ) return ''
			const owner = this.task_owner().get( id )
			return owner ? this.list_title( owner ) : ''
		}

		task_myday( id: string, next?: boolean ) {
			const today = $bog_microtodo_day()
			if( next === undefined ) return this.home().Day()?.key( id )?.val() === today
			this.home().Day( 'auto' )!.key( id, 'auto' ).val( next ? today : '' )
			return next
		}

		task_done( id: string, next?: boolean ) {
			const task = this.task( id )
			if( next === undefined ) return task.Done()?.val() ?? false
			task.Done( 'auto' )!.val( next )
			task.Finished( 'auto' )!.val( next ? Date.now() : 0 )
			if( next ) this.task_repeat( id )
			return next
		}

		task_repeat( id: string ) {
			const task = this.task( id )
			const repeat = task.Repeat()?.val() ?? ''
			const owner = this.task_owner().get( id )
			if( !repeat || !owner ) return
			const next = this.task_make( owner, task.Title()?.val() ?? '' )
			this.task_copy( task, next )
			next.Done( 'auto' )!.val( false )
			next.Finished( 'auto' )!.val( 0 )
			next.Due( 'auto' )!.val( $bog_microtodo_due_next( task.Due()?.val() || $bog_microtodo_day(), repeat ) )
			for( const link of next.Steps()?.items() ?? [] ) {
				this.$.$giper_baza_glob.Pawn( link, $bog_microtodo_step ).Done( 'auto' )!.val( false )
			}
		}

		task_make( list: string, title: string ) {
			const task = this.tasks_store( list ).make( null )
			task.Title( 'auto' )!.val( title )
			task.Created( 'auto' )!.val( Date.now() )
			return task
		}

		task_copy( from: $bog_microtodo_task, to: $bog_microtodo_task ) {
			to.Title( 'auto' )!.val( from.Title()?.val() ?? '' )
			to.Done( 'auto' )!.val( from.Done()?.val() ?? false )
			to.Important( 'auto' )!.val( from.Important()?.val() ?? false )
			to.Due( 'auto' )!.val( from.Due()?.val() ?? '' )
			to.Repeat( 'auto' )!.val( from.Repeat()?.val() ?? '' )
			to.Note( 'auto' )!.val( from.Note()?.val() ?? '' )
			to.Created( 'auto' )!.val( from.Created()?.val() ?? Date.now() )
			to.Finished( 'auto' )!.val( from.Finished()?.val() ?? 0 )
			for( const link of from.Steps()?.items() ?? [] ) {
				const source = this.$.$giper_baza_glob.Pawn( link, $bog_microtodo_step )
				const step = to.Steps( 'auto' )!.make( null )
				step.Title( 'auto' )!.val( source.Title()?.val() ?? '' )
				step.Done( 'auto' )!.val( source.Done()?.val() ?? false )
			}
		}

		task_add_enabled( id: string ) {
			return Boolean( this.task_title_new( id ).trim() )
		}

		list_add_enabled() {
			return Boolean( this.list_title_new().trim() )
		}

		@ $mol_action
		task_add( id: string ) {
			const title = this.task_title_new( id ).trim()
			if( !title ) return
			const task = this.task_make( this.list_custom( id ) ? id : 'inbox', title )
			if( id === 'important' ) task.Important( 'auto' )!.val( true )
			if( id === 'planned' ) task.Due( 'auto' )!.val( $bog_microtodo_day() )
			if( id === 'myday' ) this.task_myday( task.link().str, true )
			this.task_title_new( id, '' )
		}

		@ $mol_action
		task_drop( id: string ) {
			const owner = this.task_owner().get( id )
			if( owner ) this.tasks_store( owner ).cut( new $giper_baza_link( id ) )
			this.task_id( null )
		}

		@ $mol_action
		list_add() {
			const title = this.list_title_new().trim()
			if( !title ) return
			const list = this.home().Lists( 'auto' )!.make( null )
			list.Title( 'auto' )!.val( title )
			this.list_title_new( '' )
			this.search( '' )
			this.task_id( null )
			this.list_id( list.link().str )
		}

		@ $mol_action
		list_drop( id: string ) {
			this.home().Lists( 'auto' )!.cut( new $giper_baza_link( id ) )
			this.task_id( null )
			this.list_id( 'inbox' )
		}

		list_share( id: string ) {
			$mol_wire_async( this ).list_publish( id )
		}

		list_publish( id: string ) {
			const source = this.list( id )
			const tasks = [ ... this.list_task_ids( id ) ].reverse()
			const land = this.$.$giper_baza_glob.land_grab([[ null, $giper_baza_rank_deny ]])
			const target = land.Data( $bog_microtodo_list )
			target.Title( 'auto' )!.val( source.Title()?.val() ?? '' )
			$bog_microtodo_invite_make( land )
			for( const task of tasks ) {
				const copy = target.Tasks( 'auto' )!.make( null )
				this.task_copy( this.task( task ), copy )
				if( this.task_myday( task ) ) this.task_myday( copy.link().str, true )
			}
			const lists = this.home().Lists( 'auto' )!
			lists.items( lists.items().map( link => link.str === id ? target.link() : link ) )
			this.task_id( null )
			this.list_id( target.link().str )
			return target.link().str
		}

		@ $mol_mem
		merge_apply() {
			const lord = this.$.$mol_state_local.value( 'bog_microtodo_merge' ) as string | null
			if( !lord ) return null
			const land = this.$.$giper_baza_glob.Land( new $giper_baza_link( lord ) )
			const home = this.home()
			if( land.link().str === home.land().link().str ) {
				this.$.$mol_state_local.value( 'bog_microtodo_merge', null )
				return null
			}
			const old = land.Data( $bog_microtodo_home )
			const inbox = old.Inbox()?.items() ?? []
			const lists = old.Lists()?.items() ?? []
			this.$.$mol_state_local.value( 'bog_microtodo_merge', null )
			this.merge_tasks( old, inbox, home.Inbox( 'auto' )! )
			const links = home.Lists( 'auto' )!
			for( const link of lists ) {
				if( links.has( link ) ) continue
				if( link.land().str !== land.link().str ) {
					links.items([ ... links.items(), link ])
					continue
				}
				const source = this.$.$giper_baza_glob.Pawn( link, $bog_microtodo_list )
				const target = links.make( null )
				target.Title( 'auto' )!.val( source.Title()?.val() ?? '' )
				this.merge_tasks( old, source.Tasks()?.items() ?? [], target.Tasks( 'auto' )! )
			}
			return lord
		}

		merge_tasks( old: $bog_microtodo_home, tasks: readonly $giper_baza_link[], target: ReturnType< $bog_microtodo_list[ 'Tasks' ] > & {} ) {
			const today = $bog_microtodo_day()
			for( const link of tasks ) {
				const copy = target.make( null )
				this.task_copy( this.$.$giper_baza_glob.Pawn( link, $bog_microtodo_task ), copy )
				if( old.Day()?.key( link.str )?.val() === today ) this.task_myday( copy.link().str, true )
			}
		}

		@ $mol_mem
		join_apply() {
			const id = this.$.$mol_state_arg.value( 'join' )
			if( !id ) return null
			const link = $giper_baza_link.check( id )
			if( !link ) return null
			const key = this.$.$mol_state_arg.value( 'invite' ) ?? ''
			if( key && !this.join_member( link, key ) ) return null
			const lists = this.home().Lists( 'auto' )!
			if( !lists.has( link ) ) lists.items([ ... lists.items(), link ])
			this.$.$mol_state_arg.value( 'invite', null )
			this.$.$mol_state_arg.value( 'join', null )
			this.list_id( link.str )
			return link.str
		}

		join_started = new Set< string >()

		join_member( link: $giper_baza_link, key: string ) {
			const land = this.$.$giper_baza_glob.Land( link.land() )
			land.sync()
			if( land._gift.get( this.$.$giper_baza_auth.current().pass().lord().str ) ) return true
			if( !land._gift.get( $giper_baza_auth.from( key ).pass().lord().str ) ) return false
			if( !$bog_microtodo_invite_open( land, key ) ) return true
			if( this.join_started.has( link.str ) ) return false
			this.join_started.add( link.str )
			$mol_wire_async( this ).join_accept( link, key )
			return false
		}

		join_accept( link: $giper_baza_link, key: string ) {
			const land = this.$.$giper_baza_glob.Land( link.land() )
			$bog_microtodo_invite.accept( land, key, this.$.$giper_baza_auth.current().pass() )
		}

	}

}
