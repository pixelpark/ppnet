function stickyActionBar() {
	jQuery('#app_content_area').waypoint(function(direction){
		if(direction === "down"){
			jQuery('.app_action_wrapper').addClass('sticky');
			jQuery('.postings').addClass('sticky');
		} else {
			jQuery('.app_action_wrapper').removeClass('sticky');
			jQuery('.postings').removeClass('sticky');
		}
	});
	return true;
};


