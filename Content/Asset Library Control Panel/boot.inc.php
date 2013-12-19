<?php

ControlPanel::registerPage("Assets", "Create", "edit/create.json", true, 0, 0);
ControlPanel::registerPage("Assets", "Manage", "edit/manage.json", true, 0, 0);
ControlPanel::registerPage("Assets", "Edit", "edit/edit.json", false);

ControlPanel::registerPage("Assets", "Create Category", "edit/create-category.json", false);
ControlPanel::registerPage("Assets", "Edit Category", "edit/edit-category.json", false);
ControlPanel::registerPage("Assets", "Categories", "edit/categories.json", true);

?>
