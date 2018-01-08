package com.app_demo;

import android.app.Activity;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.soloader.SoLoader;

public class MainActivity extends ReactActivity {

    private static Activity mCurrentMainActivity = null;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "App_Demo";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mCurrentMainActivity = this;
    }

    public static Activity getActivity() {
        Activity activity = mCurrentMainActivity;
        return activity;
    }
}
