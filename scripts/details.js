$("[href^='#']").on("click", function() {
  const $target = $(this.getAttribute("href"));
  if ($target.is(":hidden")) {
    $target.parents("details").prop("open", true);
  }
});