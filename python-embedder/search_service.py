
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def get_relevant_notes(user_query, all_notes_embeddings, k=3):
    # ۱. تبدیل سوال کاربر به بردار (با همان مدلی که یادداشت‌ها را embed کردید)
    query_embedding = model.encode(user_query)

    # ۲. محاسبه شباهت کسینوسی بین سوال و تمام یادداشت‌ها
    similarities = cosine_similarity([query_embedding], all_notes_embeddings)

    # ۳. انتخاب k تا از بهترین یادداشت‌ها
    top_indices = np.argsort(similarities[0])[-k:][::-1]
    return top_indices # ایندکس یادداشت‌های مرتبط


def create_rag_prompt(user_query, retrieved_notes):
    # retrieved_notes لیست متن یادداشت‌های مرتبط است
    context = "\n\n".join([f"یادداشت شماره {i+1}: {note}" for i, note in enumerate(retrieved_notes)])

    prompt = f"""
    شما دستیار هوشمند MegaObsidian هستید. از اطلاعات زیر برای پاسخ به سوال کاربر استفاده کنید.
    اگر جواب در متن نبود، بگویید «در یادداشت‌های شما اطلاعاتی یافت نشد».

    متن یادداشت‌ها:
    {context}

    سوال کاربر: {user_query}
    """
    return prompt

