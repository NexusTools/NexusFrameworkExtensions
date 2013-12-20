<?php
ControlPanel::registerPage("Content", "Create", "edit/create.inc.php", true, 0, 0);
ControlPanel::registerPage("Content", "Manage", "edit/manage.inc.php", true, 0, 0);

ControlPanel::registerPage("Content", "Edit", "edit/edit.inc.php", false);
ControlPanel::registerPage("Content", "Edit Widgets", "edit/edit-widgets.inc.php", false);
ControlPanel::registerPage("Content", "Edit Widget", "edit/edit-widget.inc.php", false);
ControlPanel::registerPage("Content", "Delete Widget", "edit/delete-widget.inc.php", false);
ControlPanel::registerPage("Content", "Create Widget", "edit/create-widget.inc.php", false);

ControlPanel::registerPage("Content", "Delete", "edit/delete.inc.php", false);

EditCore::registerEditor("layout", "editors/layout.inc.php");
?>
