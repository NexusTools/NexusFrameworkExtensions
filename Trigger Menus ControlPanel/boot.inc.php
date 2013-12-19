<?php
ControlPanel::registerPage("Menus", "Create", "edit/create.inc.php", true, 0, 0);
ControlPanel::registerPage("Menus", "Manage", "edit/manage.inc.php", true, 0, 0);

ControlPanel::registerPage("Menus", "Edit Page", "edit/edit.inc.php", false);
ControlPanel::registerPage("Menus", "Edit Widgets", "edit/edit-widgets.inc.php", false);
ControlPanel::registerPage("Menus", "Edit Widget", "edit/edit-widget.inc.php", false);
ControlPanel::registerPage("Menus", "Delete Widget", "edit/delete-widget.inc.php", false);
ControlPanel::registerPage("Menus", "Create Widget", "edit/create-widget.inc.php", false);

ControlPanel::registerPage("Menus", "Delete", "edit/delete.inc.php", false);
?>
