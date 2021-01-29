export default function beautifyDate (date) {
    if (!date) return "";
    let _date = new Date(date);
    let daydiff = Math.floor((Date.now() - _date) / 1000 / 86400);
    let timediff = (new Date().getTime() - _date) / 1000;
  
    if (isNaN(daydiff) || daydiff < 0) return "";
  
    return (
      (daydiff === 0 &&
        ((timediff < 60 && "только что") ||
          (timediff < 120 && "минуту назад") ||
          (timediff < 3600 && Math.floor(timediff / 60) + " мин. назад") ||
          (timediff < 7200 && "час назад") ||
          (timediff < 86400 && Math.floor(timediff / 3600) + " час. назад"))) ||
      (daydiff === 1 && "вчера") ||
      (daydiff < 5 && daydiff + " дня назад") ||
      (daydiff < 7 && daydiff + " дней назад") ||
      (daydiff < 14 && "неделю назад") ||
      (daydiff < 21 && "2 недели назад") ||
      (daydiff < 31 && "3 недели назад") ||
      (daydiff === 31 && daydiff + " месяц назад") ||
      (daydiff < 365 && Math.floor(daydiff / 31) + " мес. назад") ||
      (daydiff === 365 && "год назад") ||
      (daydiff > 365 && "больше года назад")
    );
}